import ActivityContainer from "./ActivityContainer";
import ActivityTabs from "./ActivityTabs";

const ActivityDisplay = () => {

    const tabsContent = () => {
        return (
            {ActivityTabs}
        );
    };

    const containerContent = () => {
        return (
            {ActivityContainer}
        )
    }

    return(
        <>
            {tabsContent}
            {containerContent}
        </>
    );
};

export default ActivityDisplay;