import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async connect() {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('No token found, cannot connect to SignalR');
            return false;
        }

        // Prevent multiple connections
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return true;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7033/notificationHub', {
                accessTokenFactory: () => token,
                transport: signalR.HttpTransportType.WebSockets,
                skipNegotiation: true
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff: 0s, 2s, 10s, 30s, 60s
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    if (retryContext.previousRetryCount === 3) return 30000;
                    return 60000;
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Connection event handlers
        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting...', error);
            this.isConnected = false;
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected:', connectionId);
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.connection.onclose((error) => {
            console.log('SignalR connection closed:', error);
            this.isConnected = false;

            // Attempt manual reconnection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, 5000);
            }
        });

        try {
            await this.connection.start();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('SignalR connected successfully');
            return true;
        } catch (error) {
            console.error('SignalR connection error:', error);
            this.isConnected = false;
            return false;
        }
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop();
                this.isConnected = false;
                console.log('SignalR disconnected');
            } catch (error) {
                console.error('Error disconnecting SignalR:', error);
            }
        }
    }

    // Subscribe to notifications
    onNotification(callback) {
        if (this.connection) {
            this.connection.on('ReceiveNotification', callback);
        }
    }

    // Subscribe to stats updates
    onStatsUpdate(callback) {
        if (this.connection) {
            this.connection.on('ReceiveStatsUpdate', callback);
        }
    }

    // Unsubscribe from notifications
    offNotification(callback) {
        if (this.connection) {
            this.connection.off('ReceiveNotification', callback);
        }
    }

    // Unsubscribe from stats updates
    offStatsUpdate(callback) {
        if (this.connection) {
            this.connection.off('ReceiveStatsUpdate', callback);
        }
    }

    // Subscribe to job updates
    onJobUpdate(callback) {
        if (this.connection) {
            this.connection.on('ReceiveJobUpdate', callback);
        }
    }

    // Unsubscribe from job updates
    offJobUpdate(callback) {
        if (this.connection) {
            this.connection.off('ReceiveJobUpdate', callback);
        }
    }

    // Check connection status
    isConnectionActive() {
        return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
