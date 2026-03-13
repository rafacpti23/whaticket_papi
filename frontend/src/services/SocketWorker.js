import io from "socket.io-client";

const isDevelopment = process.env.NODE_ENV === "development";

class SocketWorker {
  constructor(companyId, userId) {
    if (!SocketWorker.instance) {
      this.companyId = companyId;
      this.userId = userId;
      this.socket = null;
      this.manualDisconnect = false;
      this.eventListeners = {};
      this.configureSocket();
      SocketWorker.instance = this;
    }

    return SocketWorker.instance;
  }

  configureSocket() {
    this.manualDisconnect = false;
    this.socket = io(`${process.env.REACT_APP_BACKEND_URL}/${this?.companyId}`, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: isDevelopment ? ["polling"] : ["websocket", "polling"],
      query: { userId: this.userId }
    });

    this.socket.on("disconnect", () => {
      if (!this.manualDisconnect) {
        this.reconnectAfterDelay();
      }
    });
  }

  on(event, callback) {
    this.connect();
    this.socket.on(event, callback);

    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    this.eventListeners[event].push(callback);
  }

  emit(event, data) {
    this.connect();
    this.socket.emit(event, data);
  }

  off(event, callback) {
    this.connect();

    if (!this.eventListeners[event]) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
      this.eventListeners[event] = this.eventListeners[event].filter(
        cb => cb !== callback
      );
      return;
    }

    this.eventListeners[event].forEach(cb => this.socket.off(event, cb));
    delete this.eventListeners[event];
  }

  disconnect() {
    if (this.socket) {
      this.manualDisconnect = true;
      this.socket.disconnect();
      this.socket = null;
      SocketWorker.instance = null;
    }
  }

  reconnectAfterDelay() {
    setTimeout(() => {
      if (!this.socket || !this.socket.connected) {
        this.connect();
      }
    }, 1000);
  }

  connect() {
    if (!this.socket) {
      this.configureSocket();
    }
  }

  forceReconnect() {}
}

const instance = (companyId, userId) => new SocketWorker(companyId, userId);

export default instance;
