
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmotionDetails } from "@/lib/types";
import { 
  Smile, Frown, Flame, Skull, 
  Zap, XCircle, MinusCircle, Coffee 
} from "lucide-react";

interface EmotionCardProps {
  emotion: EmotionDetails;
  onSelect: (emotionId: string) => void;
  isSelected?: boolean;
}

const EmotionCard = ({ emotion, onSelect, isSelected = false }: EmotionCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const getIcon = (iconName: string) => {
    const props = { className: "h-10 w-10" };
    
    switch (iconName) {
      case 'smile': return <Smile {...props} />;
      case 'frown': return <Frown {...props} />;
      case 'flame': return <Flame {...props} />;
      case 'skull': return <Skull {...props} />;
      case 'zap': return <Zap {...props} />;
      case 'x-circle': return <XCircle {...props} />;
      case 'minus-circle': return <MinusCircle {...props} />;
      case 'coffee': return <Coffee {...props} />;
      default: return <Smile {...props} />;
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 transform hover:translate-y-[-5px] ${
        isSelected 
          ? 'ring-2 ring-primary' 
          : 'hover:shadow-lg'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className={`h-2 w-full bg-gradient-to-r ${emotion.color}`}
      />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`rounded-full p-3 bg-gradient-to-br ${emotion.color} bg-opacity-10 text-white`}>
            {getIcon(emotion.icon)}
          </div>
          
          <h3 className="font-bold text-lg">{emotion.label}</h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {emotion.description}
          </p>
          
          <Button 
            variant={isSelected ? "default" : "outline"}
            className={`w-full mt-2 transition-all ${
              isSelected 
                ? `bg-gradient-to-r ${emotion.color} text-white` 
                : ''
            }`}
            onClick={() => onSelect(emotion.id)}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionCard;
