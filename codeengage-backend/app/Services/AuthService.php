<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Helpers\ApiResponse;

class AuthService
{
    private $userRepository;
    private $config;
    private $pdo;

    public function __construct($pdo, $config)
    {
        $this->pdo = $pdo;
        $this->userRepository = new \App\Repositories\UserRepository($pdo);
        $this->config = $config;
    }

    public function register(array $data)
    {
        // Validation (Basic)
        if (empty($data['email']) || empty($data['password']) || empty($data['username'])) {
            ApiResponse::error('Missing required fields', 422);
        }

        if ($this->userRepository->findByEmail($data['email'])) {
            ApiResponse::error('Email already exists', 409);
        }

        // Create user via repository
        $this->userRepository->create($data);
        $user = $this->userRepository->findByEmail($data['email']);
        
        // Trigger Email Verification (Stub for now)
        $this->sendVerificationEmail($user);

        // Auto-login
        return $this->login($data['email'], $data['password']);
    }

    public function login($email, $password)
    {
        $user = $this->userRepository->findByEmail($email);
        
        if (!$user || !password_verify($password, $user->getPasswordHash())) {
            ApiResponse::error('Invalid credentials', 401);
        }

        // JWT Payload
        $payload = [
            'user_id' => $user->getId(),
            'role' => $user->getRole(),
            'iat' => time(),
            'exp' => time() + (60 * 60) // 1 hour expiration
        ];

        $secret = $this->config['auth']['jwt']['secret'] ?? 'default_secret'; // Fallback
        $accessToken = \App\Helpers\SecurityHelper::generateJwtToken($payload, $secret);
        
        // Refresh Token
        $refreshToken = \App\Helpers\SecurityHelper::generateRandomString(64);
        $this->storeRefreshToken($user->getId(), $refreshToken);

        $userArray = $user->toArray();
        unset($userArray['password_hash']);
        
        return [
            'user' => $userArray,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => 3600
        ];
    }
    
    public function refreshToken($refreshToken)
    {
        // Find token in DB
        $stmt = $this->pdo->prepare("SELECT * FROM user_tokens WHERE token = ? AND type = 'refresh' AND expires_at > NOW()");
        $stmt->execute([$refreshToken]);
        $tokenRow = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$tokenRow) {
            ApiResponse::error('Invalid or expired refresh token', 401);
        }
        
        // Rotate Token: Delete old, create new
        $this->revokeRefreshToken($refreshToken);
        
        $user = $this->userRepository->findById($tokenRow['user_id']);
        if (!$user) {
             ApiResponse::error('User not found', 404);
        }
        
        // Generate new Access Token
        $payload = [
            'user_id' => $user->getId(),
            'role' => $user->getRole(),
            'iat' => time(),
            'exp' => time() + (60 * 60)
        ];
        
        $secret = $this->config['auth']['jwt']['secret'] ?? 'default_secret';
        $accessToken = \App\Helpers\SecurityHelper::generateJwtToken($payload, $secret);
        
        // Generate new Refresh Token (Rotation)
        $newRefreshToken = \App\Helpers\SecurityHelper::generateRandomString(64);
        $this->storeRefreshToken($user->getId(), $newRefreshToken);
        
        return [
            'access_token' => $accessToken,
            'refresh_token' => $newRefreshToken,
            'expires_in' => 3600
        ];
    }

    private function storeRefreshToken($userId, $token)
    {
        // Delete tokens older than 30 days for cleanup (optional optimization)
        
        $stmt = $this->pdo->prepare("INSERT INTO user_tokens (user_id, type, token, expires_at) VALUES (?, 'refresh', ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
        $stmt->execute([$userId, $token]);
    }
    
    private function revokeRefreshToken($token)
    {
        $stmt = $this->pdo->prepare("DELETE FROM user_tokens WHERE token = ?");
        $stmt->execute([$token]);
    }

    private function sendVerificationEmail($user)
    {
        // Generate token
        $token = \App\Helpers\SecurityHelper::generateRandomString(40);
        $stmt = $this->pdo->prepare("INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))");
        $stmt->execute([$user->getId(), $token]);
        
        // Log "Email Sent" since we don't have SMTP yet
        $logPath = __DIR__ . '/../../storage/logs/mail.log';
        $message = sprintf("[%s] To: %s | Subject: Verify Email | Link: /verify-email?token=%s\n", date('Y-m-d H:i:s'), $user->getEmail(), $token);
        file_put_contents($logPath, $message, FILE_APPEND);
    }

    public function verifyEmail($token)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM email_verifications WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $verification = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$verification) {
            ApiResponse::error('Invalid or expired verification link', 400);
        }
        
        $this->userRepository->verifyEmail($verification['user_id']);
        
        // Cleanup used token
        $stmt = $this->pdo->prepare("DELETE FROM email_verifications WHERE token = ?");
        $stmt->execute([$token]);
        
        return ['message' => 'Email verified successfully'];
    }

    public function requestPasswordReset($email)
    {
        $user = $this->userRepository->findByEmail($email);
        if (!$user) {
            // Return success even if user not found to prevent enumeration
            return ['message' => 'If an account matches that email, a reset link has been sent.'];
        }
        
        // Generate Token
        $token = \App\Helpers\SecurityHelper::generateRandomString(40);
        
        // Store in password_resets (delete old first)
        $stmt = $this->pdo->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$email]);
        
        $stmt = $this->pdo->prepare("INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$email, $token]); // Note: Migration has no expiry col, usually relies on created_at check in code
        
        // Send Email (Log)
        $logPath = __DIR__ . '/../../storage/logs/mail.log';
        $message = sprintf("[%s] To: %s | Subject: Reset Password | Link: /reset-password?token=%s&email=%s\n", date('Y-m-d H:i:s'), $email, $token, urlencode($email));
        file_put_contents($logPath, $message, FILE_APPEND);
        
        return ['message' => 'If an account matches that email, a reset link has been sent.'];
    }
    
    public function resetPassword($email, $token, $newPassword)
    {
        // Check Token (valid for 1 hour)
        $stmt = $this->pdo->prepare("SELECT * FROM password_resets WHERE email = ? AND token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute([$email, $token]);
        $reset = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$reset) {
            ApiResponse::error('Invalid or expired reset token', 400);
        }
        
        // Update Password
        $user = $this->userRepository->findByEmail($email);
        if ($user) {
            $user->setPassword($newPassword);
            $user->save();
            
            // Invalidate all API sessions (Refresh Tokens)
            $stmt = $this->pdo->prepare("DELETE FROM user_tokens WHERE user_id = ? AND type='refresh'");
            $stmt->execute([$user->getId()]);
        }
        
        // Cleanup reset token
        $stmt = $this->pdo->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$email]);
        
        return ['message' => 'Password reset successfully. Please login with your new password.'];
    }

    public function logout($userId, $allDevices = false)
    {
        if ($allDevices) {
            // Delete ALL refresh tokens for user
            $stmt = $this->pdo->prepare("DELETE FROM user_tokens WHERE user_id = ? AND type = 'refresh'");
            $stmt->execute([$userId]);
        } else {
            // In a strict JWT setup without blacklist, we can't invalidate just THIS access token easily without DB.
            // But we CAN invalidate the refresh token associated with THIS session if we tracked it.
            // For now, since we don't track which refresh token matches which access token (without extra claims),
            // we will just assume client drops the token. 
            // Better approach: Pass refresh token to logout to invalidate specific session.
            // For this implementation, we'll leave strict single-session logout as client-side only
            // unless 'all' is passed.
        }
        return true;
    }

    public function me()
    {
        // Handled by Middleware injecting user, but if called directly:
        // We assume context is set or passed.
        // For AuthController usage, it usually grabs user from request attributes set by Middleware.
        // But here we can't easily get it without arguments.
        // Let's rely on AuthController to pass the user or handle it.
        // So this method might be redundant if the Controller handles `request->user`.
        // We'll keep it simple: return null or throw.
        return null; 
    }
}