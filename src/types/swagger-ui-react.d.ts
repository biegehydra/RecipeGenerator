declare module 'swagger-ui-react' {
    import { ComponentType } from 'react';

    interface SwaggerUIProps {
        url?: string;
        spec?: object;
        docExpansion?: 'list' | 'full' | 'none';
        defaultModelExpandDepth?: number;
        [key: string]: any;
    }

    const SwaggerUI: ComponentType<SwaggerUIProps>;
    export default SwaggerUI;
} 