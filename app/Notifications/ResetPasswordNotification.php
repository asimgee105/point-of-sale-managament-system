<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $url;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(string $url)
    {
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $this->url = $this->url . '/' . $notifiable->email;

        return (new MailMessage)
            ->subject(__('messages.email.reset_password_subject'))
            ->greeting(__('messages.email.hello'))
            ->line(__('messages.email.reset_password_first_line'))
            ->action(__('messages.email.reset_password'), $this->url)
            ->line(__('messages.email.reset_password_second_line'))
            ->line(__('messages.email.regards'))
            ->salutation(getAppName());
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toArray($notifiable): array
    {
        return [
            //
        ];
    }
}
