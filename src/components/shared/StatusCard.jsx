const StatusCard = ({
    title, 
    mainValue = "0", 
    subText,
    Icon = null, 
    // FIXED: Replaced default text-custom-black with text-foreground
    color = "text-foreground",
    secondValue,
    thirdValue,
    secondSubText,
}) => {

    return (
        // FIXED: Added bg-card and text-card-foreground, replaced border-custom-gray with border-border
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 w-max-50 h-full shadow-sm mr-4 transition duration-300 hover:scale-105">
            <div className="flex justify-between items-start mb-4">
                {/* FIXED: Replaced text-custom-black with text-foreground */}
                <h3 className="text-foreground text-xl">{title}</h3>
                {Icon && <Icon className={color} size={24}></Icon>}
            </div>
            <div className="text-3xl font-bold pt-6">{mainValue}</div>
            {/* FIXED: Replaced text-custom-gray with text-muted-foreground */}
            <div className="flex items-center gap-1 text-muted-foreground text-xl pt-2">
                {secondValue && <span className={`${color} font-bold`}>{secondValue}</span>}
                {subText}
                {thirdValue && <span className={`${color} font-bold`}>{thirdValue}</span>}
                {secondSubText}
            </div>
        </div>
    );
};

/*
    Note to self: I can just put a division to any color i want to make it transparent
*/

export default StatusCard;