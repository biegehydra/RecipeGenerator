export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{
            backgroundColor: 'white',
            minHeight: '100vh',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto'
        }}>
            {children}
        </div>
    );
} 