import * as React from 'react';

interface EmailTemplateProps {
    video_id: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    video_id,
}) => (
    <div>
        <span>Check out your processed video here <a href={`http://localhost:3000/project/${video_id}`}>http://localhost:3000/project/{video_id}</a></span>
    </div>
);
