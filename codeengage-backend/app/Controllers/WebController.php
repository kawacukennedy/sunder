<?php

namespace App\Controllers;

use PDO;
use App\Repositories\SnippetRepository;
use App\Repositories\UserRepository;

class WebController
{
    private PDO $db;
    private SnippetRepository $snippetRepo;
    private UserRepository $userRepo;
    private string $templatePath;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->snippetRepo = new SnippetRepository($db);
        $this->userRepo = new UserRepository($db);
        
        // Path to the frontend index.html
        // Assumes directory structure: 
        // /Volumes/RCA/codeengage/codeengage-backend
        // /Volumes/RCA/codeengage/codeengage-frontend
        $this->templatePath = __DIR__ . '/../../../../codeengage-frontend/index.html';
    }

    /**
     * Serve the SPA application with dynamic meta tags
     */
    public function handle(string $uri): void
    {
        // Parse URI to determine route
        $parts = explode('/', trim($uri, '/'));
        $route = $parts[0] ?? '';
        $id = $parts[1] ?? null;

        $meta = [
            'title' => 'CodeEngage - Share Code. Ignite Innovation.',
            'description' => 'The enterprise-grade platform for developers to share snippets, discover solutions, and collaborate in real-time.',
            'image' => '/assets/images/og-default.png',
            'url' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$uri"
        ];

        // Route matching
        if ($route === 'snippet' && $id) {
            $meta = $this->getSnippetMeta($id, $meta);
        } elseif ($route === 'profile' && $id) {
            // In frontend route is /profile but usually it's /profile or /user/:username? 
            // The router.js has /profile (self) but presumably there should be a public view.
            // If the user meant /profile only for "me", then SSR might be less relevant unless we have /user/:username.
            // Let's assume for now we might add public profile routes later, or if this is /profile (my profile), we can't SSR it easily without auth.
            // But if it's a public profile route like /u/:username, we would handle it here.
            // For now, let's stick to safe defaults or handle specific public routes if they exist.
        }

        $this->serve($meta);
    }

    private function getSnippetMeta(string $id, array $default): array
    {
        try {
            $snippet = $this->snippetRepo->findById((int)$id);
            if ($snippet) {
                return [
                    'title' => $snippet->getTitle() . ' | CodeEngage',
                    'description' => $snippet->getDescription() ?: "Check out this {$snippet->getLanguage()} snippet on CodeEngage.",
                    'image' => $default['image'], // Could generate dynamic code images later
                    'url' => $default['url']
                ];
            }
        } catch (\Exception $e) {
            // Fallback to default
        }
        return $default;
    }

    private function serve(array $meta): void
    {
        if (!file_exists($this->templatePath)) {
            http_response_code(404);
            echo "Frontend template not found.";
            return;
        }

        $html = file_get_contents($this->templatePath);

        // Replace Title
        $html = preg_replace(
            '/<title>.*?<\/title>/', 
            "<title>{$meta['title']}</title>", 
            $html
        );

        // Replace Meta Description
        $html = $this->replaceMeta($html, 'name="description"', $meta['description']);
        $html = $this->replaceMeta($html, 'property="og:description"', $meta['description']);
        $html = $this->replaceMeta($html, 'property="twitter:description"', $meta['description']);

        // Replace Meta Title
        $html = $this->replaceMeta($html, 'property="og:title"', $meta['title']);
        $html = $this->replaceMeta($html, 'property="twitter:title"', $meta['title']);

        // Replace URL
        $html = $this->replaceMeta($html, 'property="og:url"', $meta['url']);
        $html = $this->replaceMeta($html, 'property="twitter:url"', $meta['url']);

        echo $html;
    }

    private function replaceMeta(string $html, string $attr, string $content): string
    {
        // Regex to match <meta [attr] content="..."> or <meta content="..." [attr]>
        // This is a bit simplistic but works for standard generated HTML
        
        $pattern = '/<meta\s+([^>]*?)' . preg_quote($attr, '/') . '([^>]*?)content="([^"]*?)"([^>]*?)>/i';
        
        // If content is empty, just return original
        if (empty($content)) return $html;

        // Use a callback to reconstruct the tag with new content
        return preg_replace_callback($pattern, function($matches) use ($content) {
            // reconstruct tag, replacing the content
            // However, typical order is <meta name="..." content="...">
            // Let's try a simpler robust replacement:
            // Find the tag by attribute, then replace its content attribute
            return '<meta ' . $matches[1] . $matches[2] . 'content="' . htmlspecialchars($content) . '"' . $matches[4] . '>';
        }, $html);
    }
}
