import { CircleQuestionMark } from 'lucide-react';

const StatusCard = ({
    title, 
    mainValue = "0", 
    Icon = CircleQuestionMark, 
    iconColor = "text-custom-black"
}) => {

    return (
        <div className="bg-custom-white border border-custom-black rounded-2xl p-6 min-w-[320px] shadow-sm ">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-custom-black text-xl">{title}</h3>
                <Icon className={iconColor} size={24}></Icon>
            </div>
            <div className="text-3xl font-bold">{mainValue}</div>
            <div className="text-custom-gray text-xl"></div>
        </div>
    );
};

export default StatusCard;