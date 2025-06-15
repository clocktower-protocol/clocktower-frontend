import React from 'react';

interface IconProps {
    icon: React.ComponentType<any>;
    [key: string]: any;
}

const Icon: React.FC<IconProps> = ({ icon: TheIcon, ...props }) => {
    if (!TheIcon) {
        console.warn('Invalid or undefined icon prop:', TheIcon);
        return null;
    }
    return <TheIcon {...props} />;
};

export default Icon; 