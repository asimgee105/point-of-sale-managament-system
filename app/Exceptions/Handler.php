<?php

namespace App\Exceptions;

use App\DTOs\JSONApiError;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;
use Throwable;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class Handler extends ExceptionHandler
{
    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        $code = $exception->getCode();
        $message = $exception->getMessage();
        if ($code < 100 || $code >= 600) {
            $code = ResponseAlias::HTTP_INTERNAL_SERVER_ERROR;
        }

        if ($exception instanceof ModelNotFoundException) {
            $message = $exception->getMessage();
            $code = ResponseAlias::HTTP_NOT_FOUND;

            if (preg_match('@\\\\(\w+)\]@', $message, $matches)) {
                $model = $matches[1];
                $model = preg_replace('/Table/i', '', $model);
                $message = "{$model} not found.";
            }
        }

        if ($exception instanceof ValidationException) {
            $firstError = collect($exception->errors())->first();

            return response()->json([
                'success' => false,
                'message' => $firstError[0],
                'errors' => $exception->errors(),
            ], ResponseAlias::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($exception instanceof AuthenticationException) {
            return response()->json(new JSONApiError([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]), ResponseAlias::HTTP_UNAUTHORIZED);
        }

        if ($exception instanceof UnauthorizedException) {
            return response()->json(new JSONApiError([
                'success' => false,
                'message' => 'User does not have the required permission.',
            ]), ResponseAlias::HTTP_FORBIDDEN);
        }

        //        if ($exception instanceof ValidationException) {
        //            $validator = $exception->validator;
        //            $message = $validator->errors()->first();
        //            $code = \Illuminate\Http\Response::HTTP_UNPROCESSABLE_ENTITY;
        //
        //            if (! $request->expectsJson() and ! $request->isXmlHttpRequest()) {
        //                return Redirect::back()->withInput()->withErrors($message);
        //            }
        //        }

        if ($request->expectsJson() or $request->isXmlHttpRequest()) {
            $headers = [];
            if ($exception instanceof HttpExceptionInterface) {
                $code = $exception->getStatusCode();
                $headers = $exception->getHeaders();
            }
            if ($code >= 500 && ! config('app.debug')) {
                $message = 'A server error occurred. Please try again or contact your administrator.';
            }
            return Response::json([
                'success' => false,
                'message' => $message ?: ResponseAlias::$statusTexts[$code] ?? 'Request failed.',
            ], $code, $headers);
        }

        return parent::render($request, $exception);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|ResponseAlias|void
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->isXmlHttpRequest() || $request->expectsJson()) {
            return response()->json(['error' => 'Unauthenticated.'], ResponseAlias::HTTP_UNAUTHORIZED);
        }
    }
}
