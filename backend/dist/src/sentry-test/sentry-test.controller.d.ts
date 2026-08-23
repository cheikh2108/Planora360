export declare class SentryTestController {
    testError(): void;
    testUnhandled(): void;
    testCustomEvent(): {
        message: string;
    };
    health(): {
        status: string;
        message: string;
    };
}
