const Badge = ({ className, color, text, icon }: { className?: string, color: string, text: string, icon?: JSX.Element }) => {
    const colorClasses = {
        gray: {
            bg: 'bg-gray-400/10',
            text: 'text-gray-400',
            ring: 'ring-gray-400/20',
        },
        red: {
            bg: 'bg-red-400/10',
            text: 'text-red-400',
            ring: 'ring-red-400/20',
        },
        yellow: {
            bg: 'bg-yellow-400/10',
            text: 'text-yellow-500',
            ring: 'ring-yellow-400/20',
        },
        green: {
            bg: 'bg-green-500/10',
            text: 'text-green-400',
            ring: 'ring-green-500/20',
        },
        blue: {
            bg: 'bg-blue-400/10',
            text: 'text-blue-400',
            ring: 'ring-blue-400/30',
        },
        indigo: {
            bg: 'bg-indigo-400/10',
            text: 'text-indigo-400',
            ring: 'ring-indigo-400/30',
        },
        purple: {
            bg: 'bg-purple-400/10',
            text: 'text-purple-400',
            ring: 'ring-purple-400/30',
        },
        pink: {
            bg: 'bg-pink-400/10',
            text: 'text-pink-400',
            ring: 'ring-pink-400/20',
        },
    };

    const classes = colorClasses[color as keyof typeof colorClasses];

    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-1 font-medium ${className || ''} ${classes.bg} ${classes.text} ring-1 ring-inset ${classes.ring}`}
        >
            {text}
            {icon && (
                <span className="ml-1">
                    {icon}
                </span>
            )}
        </span>
    );
};

export default Badge;