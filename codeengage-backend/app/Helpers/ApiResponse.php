<?php

namespace App\Helpers;

class ApiResponse
{
    /**
     * Success response with enhanced format
     */
    public static function success($data = [], $message = 'Success', $code = 200, array $meta = [])
    {
        http_response_code($code);
        
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        // Add request ID if available
        if (isset($_SERVER['REQUEST_ID'])) {
            $response['request_id'] = $_SERVER['REQUEST_ID'];
        }

        // Add metadata if provided
        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Enhanced error response with error codes and details
     */
    public static function error($message = 'Error', $code = 400, $errors = [], string $errorCode = null, array $details = [])
    {
        http_response_code($code);
        
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        // Add request ID if available
        if (isset($_SERVER['REQUEST_ID'])) {
            $response['request_id'] = $_SERVER['REQUEST_ID'];
        }

        // Add error code if provided
        if ($errorCode) {
            $response['error_code'] = $errorCode;
        }

        // Add validation errors if provided
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        // Add additional details if provided
        if (!empty($details)) {
            $response['details'] = $details;
        }

        // Add suggested action based on status code
        $response['suggested_action'] = self::getSuggestedAction($code);

        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Validation error response
     */
    public static function validationError(array $errors, string $message = 'Validation failed')
    {
        self::error($message, 422, $errors, 'VALIDATION_FAILED', [
            'error_type' => 'validation',
            'total_errors' => count($errors)
        ]);
    }

    /**
     * Not found error response
     */
    public static function notFound(string $message = 'Resource not found', string $errorCode = 'NOT_FOUND')
    {
        self::error($message, 404, [], $errorCode, [
            'error_type' => 'not_found'
        ]);
    }

    /**
     * Unauthorized error response
     */
    public static function unauthorized(string $message = 'Authentication required', string $errorCode = 'UNAUTHORIZED')
    {
        self::error($message, 401, [], $errorCode, [
            'error_type' => 'authentication',
            'suggested_action' => 'Please login and try again'
        ]);
    }

    /**
     * Forbidden error response
     */
    public static function forbidden(string $message = 'Access denied', string $errorCode = 'FORBIDDEN')
    {
        self::error($message, 403, [], $errorCode, [
            'error_type' => 'authorization',
            'suggested_action' => 'You do not have permission to perform this action'
        ]);
    }

    /**
     * Rate limit error response
     */
    public static function rateLimit(string $message = 'Too many requests', string $errorCode = 'RATE_LIMIT_EXCEEDED')
    {
        self::error($message, 429, [], $errorCode, [
            'error_type' => 'rate_limit',
            'suggested_action' => 'Please wait before making more requests'
        ]);
    }

    /**
     * Server error response
     */
    public static function serverError(string $message = 'Internal server error', string $errorCode = 'INTERNAL_ERROR')
    {
        self::error($message, 500, [], $errorCode, [
            'error_type' => 'server_error',
            'suggested_action' => 'Please try again later or contact support'
        ]);
    }

    /**
     * Service unavailable error response
     */
    public static function serviceUnavailable(string $message = 'Service temporarily unavailable', string $errorCode = 'SERVICE_UNAVAILABLE')
    {
        self::error($message, 503, [], $errorCode, [
            'error_type' => 'service_unavailable',
            'suggested_action' => 'Please try again later'
        ]);
    }

    /**
     * Get suggested action based on HTTP status code
     */
    private static function getSuggestedAction(int $code): string
    {
        $actionMap = [
            400 => 'Please check your request and try again',
            401 => 'Please login and try again',
            403 => 'You do not have permission to perform this action',
            404 => 'The requested resource was not found',
            405 => 'HTTP method not allowed for this endpoint',
            409 => 'There is a conflict with the current state of the resource',
            422 => 'Please check your input data and try again',
            429 => 'Please wait before making more requests',
            500 => 'An internal error occurred. Please try again later',
            502 => 'The server is temporarily unavailable. Please try again later',
            503 => 'The service is temporarily unavailable. Please try again later',
            504 => 'The request timed out. Please try again later'
        ];

        return $actionMap[$code] ?? 'An error occurred. Please try again';
    }

    /**
     * Paginated response helper
     */
    public static function paginated($data, int $page, int $limit, int $total, string $message = 'Success', array $meta = [])
    {
        $totalPages = ceil($total / $limit);
        
        $paginationMeta = [
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total_items' => $total,
                'total_pages' => $totalPages,
                'has_next_page' => $page < $totalPages,
                'has_prev_page' => $page > 1
            ]
        ];

        // Merge with additional metadata
        $meta = array_merge($paginationMeta, $meta);

        self::success($data, $message, 200, $meta);
    }

    /**
     * Created response helper
     */
    public static function created($data = [], string $message = 'Resource created successfully')
    {
        self::success($data, $message, 201);
    }

    /**
     * Accepted response helper
     */
    public static function accepted($data = [], string $message = 'Request accepted for processing')
    {
        self::success($data, $message, 202);
    }

    /**
     * No content response helper
     */
    public static function noContent(string $message = 'Request processed successfully')
    {
        http_response_code(204);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s'),
            'request_id' => $_SERVER['REQUEST_ID'] ?? null
        ], JSON_PRETTY_PRINT);
        exit;
    }
}