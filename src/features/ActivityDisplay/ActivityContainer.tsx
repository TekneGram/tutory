import { activityRegistry } from "./registry/activityRegistry"
const ActivityContainer = () => {

    const LayerComponent = activityRegistry[activeActivity.activityType].component;
    return (
        <>
            {LayerComponent}
        </>
    );
};

export default ActivityContainer;