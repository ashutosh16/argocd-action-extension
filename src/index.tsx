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
        application.metadata?.labels && application.metadata.labels['application.environmentLabelKey'] === "prd" ? (
            <>
                <button onClick={openFlyout} style={{ marginRight: '2px' }} className="argo-button argo-button--base">
                    <span style={{ marginLeft: '-5px', marginRight: '5px' }} className="show-for-large"> Permissions</span>
                </button>
            </>
        ):<></>
    );
};


export const StatusExtension: React.FC<ExtensionProps> = ({ application, openFlyout }) => {


    const data =  JSON.parse(localStorage.getItem(application.metadata.name)) ;
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        if (!data) return;

        const expiryTime = moment(data.expiryTime);
        const diffInSeconds = expiryTime.diff(moment(), 'seconds');

        if (diffInSeconds <= 0) {
            console.log("Time has expired");
            localStorage.removeItem(application.metadata?.name);
            return;
        }

        const timeoutId = setTimeout(() => {
            console.log("Time has expired");
            localStorage.removeItem(application.metadata?.name);
            setRefresh(false)
        }, diffInSeconds * 1000); // Convert seconds to milliseconds

        return () => clearTimeout(timeoutId); // Cleanup the timeout on component unmount
    }, [data]);
    return  data && data.expiryTime ? (
        <div key={data?.name}>
            Devops user can perform the prod changes until {data.currentTime}
        </div>
    ) : (
        <div style={{ fontWeight: 500, color: 'green', textAlign: 'center' }}>READ ONLY</div>
    );
};

interface FlyoutProps {
    application: any;
}

export const ActionFlyout = ({ application }: FlyoutProps) => {
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
export const statusComponent = StatusExtension;

export const flyout = ActionFlyout;

// Register the component extension in ArgoCD
(window as any)?.extensionsAPI?.registerToolBarExtension(toolbarComponent, TITLE, ID, flyout);
(window as any)?.extensionsAPI?.registerStatusPanelExtension(statusComponent, TITLE, ID);
