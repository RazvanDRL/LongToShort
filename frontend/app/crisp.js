"use client";

import { useEffect } from 'react';

const CrispChat = () => {
    useEffect(() => {
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = "72af0175-a4c7-47af-a25c-3c5f1b84b1bb";
        (function () {
            var d = document;
            var s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js";
            s.async = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
        })();
    }, []);

    return null; // Since this component only handles script injection, it doesn't render anything
};

export default CrispChat;
