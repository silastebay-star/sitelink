// Web Push Notifications using VAPID
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null

  async initialize() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[v0] Push notifications not supported")
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error("[v0] Service worker not ready:", error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    return await Notification.requestPermission()
  }

  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) return null

    try {
      const permission = await this.requestPermission()
      if (permission !== "granted") {
        console.warn("[v0] Push permission denied")
        return null
      }

      // Get existing subscription or create new one
      let subscription = await this.registration.pushManager.getSubscription()

      if (!subscription) {
        // VAPID public key should be set as environment variable
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        if (!vapidPublicKey) {
          console.warn("[v0] VAPID public key not configured")
          return null
        }

        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
        })

        // Save subscription to database
        await this.saveSubscription(userId, subscription)
      }

      return subscription
    } catch (error) {
      console.error("[v0] Push subscription failed:", error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) return false

    const subscription = await this.registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  }

  private async saveSubscription(userId: string, subscription: PushSubscription) {
    // Save to database via API endpoint
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
      }),
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }
}

export const pushNotifications = new PushNotificationManager()
