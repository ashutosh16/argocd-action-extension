import React, {  useEffect, useState } from "react";
import * as moment from 'moment';


const TITLE = "Change Request";
const ID = "Change_Request";


export interface ExtensionProps {
    application: any;
    openFlyout: () => any;
    props: any;
}



export const ActionExtension: React.FC<ExtensionProps> = ({ application, openFlyout }) => {
    return (
            <>
             permissions
            </>
    );
};


interface FlyoutProps {
    application: any;
}

export const ActionMenuFlyout = ({ application }: FlyoutProps) => {
    const currentTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    const expiryTime = moment().add(1,'minute');
    const mockData = { expiryTime: expiryTime, currentTime: currentTime, subtitle: "Elevation Granted", userMsg: "Application changes can perform until ...." };
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

        let isMounted = true;

        fetch('https://www.google.com')
            .then(response => response.text())
            .then(() => {
                if (isMounted && loading) {
                    setData(mockData);
                    localStorage.setItem(application.metadata.name, JSON.stringify(mockData));
                    setLoading(false);

                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                if (isMounted) {
                    const storedData = localStorage.getItem(application.metadata.name);
                    if (!storedData) {
                        localStorage.setItem(application.metadata.name, JSON.stringify(mockData));
                        setData(mockData);
                    } else {
                        setData(JSON.parse(storedData));
                    }
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <></>;
};
export const toolbarComponent = ActionExtension;

export const flyout = ActionMenuFlyout;

const showDeploy = (application: any) => {
    console.log(application.metadata?.labels && application.metadata.labels['application.environmentLabelKey'] === "prd");
    return application.metadata?.labels && application.metadata.labels['application.environmentLabelKey'] === "prd";
}
// Register the component extension in ArgoCD
(window as any)?.extensionsAPI?.
registerTopBarActionMenuExt(toolbarComponent, TITLE, ID,flyout,showDeploy,'', true);
