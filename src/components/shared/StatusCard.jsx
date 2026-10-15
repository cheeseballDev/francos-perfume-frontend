const StatusCard = ({
    title, 
    mainValue = "0", 
    subText,
    Icon = null, 
    color = "text-foreground",
    secondValue,
    thirdValue,
    secondSubText,
}) => {

    return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 h-full flex flex-col justify-between shadow-sm transition duration-300 hover:scale-105">
        <div>
            <div className="flex justify-between items-start mb-2 min-h-[3.5rem]">
                <h3 className="text-foreground text-xl leading-snug">{title}</h3>
                {Icon && <Icon className={`${color} shrink-0 ml-2`} size={24} />}
            </div>
            <div className="text-2xl font-bold">{mainValue}</div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground text-sm pt-2">
            {secondValue && <span className={`${color} font-bold`}>{secondValue}</span>}
            {subText}
            {thirdValue && <span className={`${color} font-bold`}>{thirdValue}</span>}
            {secondSubText}
        </div>
    </div>
    );
};

export default StatusCard;