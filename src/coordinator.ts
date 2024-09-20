type EventCallback = (data: any) => void;

interface EventStore {
    [eventName: string]: EventCallback[];
}

class Coordinator {
    private cStore: EventStore = {};

    on(evtName: string, callback: EventCallback): void {
        if (!this.cStore[evtName]) {
            this.cStore[evtName] = [];
        }
        this.cStore[evtName].push(callback);
    }

    emit(evtName: string, data: any): void {
        const callbacks = this.cStore[evtName];
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}

export default Coordinator;
