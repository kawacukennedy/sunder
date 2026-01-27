<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\AuditRepository;
use App\Helpers\SecurityHelper;
use App\Exceptions\ValidationException;
use App\Exceptions\UnauthorizedException;

class AuthService
{
    private UserRepository $userRepository;
    private AuditRepository $auditRepository;
    private SecurityHelper $securityHelper;
    private array $config;

    public function __construct(
        UserRepository $userRepository,
        AuditRepository $auditRepository,
        SecurityHelper $securityHelper,
        array $config = []
    ) {
        $this->userRepository = $userRepository;
        $this->auditRepository = $auditRepository;
        $this->securityHelper = $securityHelper;
        $this->config = array_merge([
            'session_lifetime' => 7200,
            'max_login_attempts' => 5,
            'login_lockout_time' => 300,
            'password_min_length' => 8
        ], $config);
    }

    public function register(array $userData): array
    {
        $this->validateRegistrationData($userData);

        if ($this->userRepository->findByEmail($userData['email'])) {
            throw new ValidationException(['email' => 'Email already exists']);
        }

        if ($this->userRepository->findByUsername($userData['username'])) {
            throw new ValidationException(['username' => 'Username already exists']);
        }

        $userData['password_hash'] = password_hash(
            $userData['password'],
            PASSWORD_ARGON2ID,
            ['cost' => 12]
        );

        unset($userData['password']);

        $user = $this->userRepository->create($userData);

        $this->auditRepository->log(
            $user->getId(),
            'user.register',
            'user',
            $user->getId(),
            null,
            ['email' => $user->getEmail(), 'username' => $user->getUsername()]
        );

        $this->createUserSession($user);

        return $this->sanitizeUser($user->toArray());
    }

    public function login(string $email, string $password, string $ipAddress, string $userAgent): array
    {
        if ($this->isRateLimited($ipAddress)) {
            throw new UnauthorizedException('Too many login attempts. Please try again later.');
        }

        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            $this->recordLoginAttempt(null, $ipAddress, $userAgent, false);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!$user->verifyPassword($password)) {
            $this->recordLoginAttempt($user->getId(), $ipAddress, $userAgent, false);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (password_needs_rehash($user->getPasswordHash(), PASSWORD_ARGON2ID)) {
            $newHash = password_hash($password, PASSWORD_ARGON2ID, ['cost' => 12]);
            $this->userRepository->update($user->getId(), ['password_hash' => $newHash]);
        }

        $this->recordLoginAttempt($user->getId(), $ipAddress, $userAgent, true);
        $this->userRepository->update($user->getId(), ['last_active_at' => date('Y-m-d H:i:s')]);

        $this->createUserSession($user);

        $this->auditRepository->log(
            $user->getId(),
            'user.login',
            'user',
            $user->getId(),
            null,
            ['ip_address' => $ipAddress]
        );

        return $this->sanitizeUser($user->toArray());
    }

    public function logout(int $userId): void
    {
        session_destroy();
        setcookie('session_token', '', time() - 3600, '/');

        $this->auditRepository->log(
            $userId,
            'user.logout',
            'user',
            $userId,
            null,
            null
        );
    }

    public function refreshToken(): array
    {
        if (empty($_SESSION['user_id'])) {
            throw new UnauthorizedException('No active session');
        }

        $user = $this->userRepository->findById($_SESSION['user_id']);
        if (!$user) {
            throw new UnauthorizedException('User not found');
        }

        $this->regenerateSession();
        $this->userRepository->update($user['id'], ['last_active_at' => date('Y-m-d H:i:s')]);

        return $this->sanitizeUser($user);
    }

    public function getCurrentUser(): ?array
    {
        if (empty($_SESSION['user_id'])) {
            return null;
        }

        $user = $this->userRepository->findById($_SESSION['user_id']);
        return $user ? $this->sanitizeUser($user) : null;
    }

    public function changePassword(int $userId, string $currentPassword, string $newPassword): void
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new UnauthorizedException('User not found');
        }

        if (!password_verify($currentPassword, $user['password_hash'])) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        $this->validatePassword($newPassword);

        $passwordHash = password_hash($newPassword, PASSWORD_ARGON2ID, ['cost' => 12]);

        $this->userRepository->update($userId, ['password_hash' => $passwordHash]);

        $this->auditRepository->log(
            $userId,
            'user.password_change',
            'user',
            $userId,
            null,
            null
        );
    }

    private function validateRegistrationData(array $data): void
    {
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException(['email' => 'Valid email is required']);
        }

        if (empty($data['username']) || strlen($data['username']) < 3) {
            throw new ValidationException(['username' => 'Username must be at least 3 characters long']);
        }

        if (!preg_match('/^[a-zA-Z0-9_]+$/', $data['username'])) {
            throw new ValidationException(['username' => 'Username can only contain letters, numbers, and underscores']);
        }

        $this->validatePassword($data['password'] ?? '');

        if (isset($data['display_name']) && strlen($data['display_name']) > 100) {
            throw new ValidationException(['display_name' => 'Display name cannot exceed 100 characters']);
        }
    }

    private function validatePassword(string $password): void
    {
        if (strlen($password) < $this->config['password_min_length']) {
            throw new ValidationException(['password' => "Password must be at least {$this->config['password_min_length']} characters long"]);
        }

        if (!preg_match('/[A-Z]/', $password)) {
            throw new ValidationException(['password' => 'Password must contain at least one uppercase letter']);
        }

        if (!preg_match('/[a-z]/', $password)) {
            throw new ValidationException(['password' => 'Password must contain at least one lowercase letter']);
        }

        if (!preg_match('/[0-9]/', $password)) {
            throw new ValidationException(['password' => 'Password must contain at least one number']);
        }
    }

    private function createUserSession(\App\Models\User $user): void
    {
        session_regenerate_id(true);
        
        $_SESSION['user_id'] = $user->getId();
        $_SESSION['username'] = $user->getUsername();
        $_SESSION['email'] = $user->getEmail();
        
        // Gracefully handle missing roles/permissions tables
        try {
            $_SESSION['roles'] = $this->userRepository->getUserRoles($user->getId());
        } catch (\Throwable $e) {
            $_SESSION['roles'] = [];
        }
        
        try {
            $_SESSION['permissions'] = $this->userRepository->getUserPermissions($user->getId());
        } catch (\Throwable $e) {
            $_SESSION['permissions'] = [];
        }
        
        $_SESSION['last_activity'] = time();
        $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';

        $sessionToken = $this->securityHelper->generateSecureToken(32);
        setcookie('session_token', $sessionToken, [
            'expires' => time() + $this->config['session_lifetime'],
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }

    private function regenerateSession(): void
    {
        session_regenerate_id(true);
        $_SESSION['last_activity'] = time();
    }

    private function isRateLimited(string $ipAddress): bool
    {
        $recentAttempts = $this->userRepository->getRecentLoginAttempts(
            $ipAddress,
            $this->config['login_lockout_time']
        );

        return count($recentAttempts) >= $this->config['max_login_attempts'];
    }

    private function recordLoginAttempt(?int $userId, string $ipAddress, string $userAgent, bool $success): void
    {
        $this->userRepository->recordLoginAttempt([
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'success' => $success,
            'attempt_time' => date('Y-m-d H:i:s')
        ]);
    }

    private function sanitizeUser(array $user): array
    {
        unset($user['password_hash']);
        unset($user['password_reset_token']);
        unset($user['password_reset_expires']);
        
        return $user;
    }
}