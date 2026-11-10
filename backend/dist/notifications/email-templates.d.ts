export declare class EmailTemplates {
    private readonly frontendUrl;
    constructor(frontendUrl: string);
    base(params: {
        title: string;
        preheader?: string;
        content: string;
        headerGradient?: string;
        showLogo?: boolean;
        footerNote?: string;
    }): string;
    button(params: {
        text: string;
        url: string;
        color?: string;
    }): string;
    infoCard(params: {
        title?: string;
        rows: Array<{
            label: string;
            value: string;
        }>;
    }): string;
    alert(params: {
        type: 'info' | 'warning' | 'success' | 'error';
        message: string;
    }): string;
    divider(): string;
}
