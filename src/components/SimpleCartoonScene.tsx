// Simple cartoon scene generator for spot the difference game
import React from 'react';

interface SimpleCartoonSceneProps {
  sceneType: 'playground' | 'bedroom' | 'kitchen' | 'classroom' | 'toys' | 'garden';
  differences?: string[]; // Array of difference IDs to show/hide elements
  width?: number;
  height?: number;
}

const SimpleCartoonScene: React.FC<SimpleCartoonSceneProps> = ({ 
  sceneType, 
  differences = [], 
  width = 500, 
  height = 400 
}) => {
  const hasDifference = (id: string) => differences.includes(id);

  const renderPlaygroundScene = () => (
    <svg width={width} height={height} viewBox="0 0 500 400" className="border-2 border-gray-300 rounded-lg">
      {/* Sky background */}
      <rect width="500" height="200" fill="#87CEEB" />
      
      {/* Ground */}
      <rect y="200" width="500" height="200" fill="#90EE90" />
      
      {/* Sun */}
      <circle cx="450" cy="50" r="30" fill="#FFD700" />
      
      {/* Clouds */}
      <ellipse cx="100" cy="60" rx="40" ry="20" fill="white" />
      <ellipse cx="300" cy="80" rx="35" ry="18" fill="white" />
      {hasDifference('extra-cloud') && (
        <ellipse cx="200" cy="40" rx="30" ry="15" fill="white" />
      )}
      
      {/* Swing set */}
      <rect x="50" y="150" width="8" height="150" fill="#8B4513" />
      <rect x="120" y="150" width="8" height="150" fill="#8B4513" />
      <rect x="50" y="150" width="78" height="8" fill="#8B4513" />
      
      {/* Swing */}
      {!hasDifference('missing-swing') && (
        <>
          <line x1="70" y1="158" x2="70" y2="220" stroke="#654321" strokeWidth="2" />
          <line x1="108" y1="158" x2="108" y2="220" stroke="#654321" strokeWidth="2" />
          <rect x="65" y="220" width="48" height="8" fill="#8B4513" rx="4" />
        </>
      )}
      
      {/* Slide */}
      <rect x="200" y="200" width="100" height="80" fill={hasDifference('slide-color') ? "#FF69B4" : "#FF4500"} />
      <polygon points="200,200 200,220 180,250 180,230" fill={hasDifference('slide-color') ? "#FF1493" : "#FF6347"} />
      
      {/* Tree */}
      <rect x="380" y="180" width="20" height="80" fill="#8B4513" />
      <circle cx="390" cy="170" r="40" fill="#228B22" />
      
      {/* Flowers */}
      <circle cx="150" cy="280" r="8" fill={hasDifference('flower-color') ? "#FF69B4" : "#FF0000"} />
      <rect x="147" y="280" width="6" height="20" fill="#228B22" />
      
      <circle cx="350" cy="290" r="8" fill="#FFFF00" />
      <rect x="347" y="290" width="6" height="20" fill="#228B22" />
      
      {/* Bird */}
      {hasDifference('extra-bird') && (
        <ellipse cx="420" cy="120" rx="8" ry="5" fill="#000" />
      )}
      
      {/* Sandbox */}
      <rect x="250" y="280" width="80" height="40" fill="#F4A460" />
      {!hasDifference('missing-toy') && (
        <rect x="270" y="270" width="15" height="15" fill="#FF0000" />
      )}
    </svg>
  );

  const renderBedroomScene = () => (
    <svg width={width} height={height} viewBox="0 0 500 400" className="border-2 border-gray-300 rounded-lg">
      {/* Background wall */}
      <rect width="500" height="400" fill="#FFB6C1" />
      
      {/* Floor */}
      <rect y="300" width="500" height="100" fill="#DEB887" />
      
      {/* Bed */}
      <rect x="50" y="200" width="150" height="100" fill="#8B4513" />
      <rect x="60" y="180" width="130" height="40" fill="#FF69B4" />
      
      {/* Pillows */}
      {!hasDifference('missing-pillow') && (
        <ellipse cx="100" cy="170" rx="25" ry="15" fill="white" />
      )}
      <ellipse cx="150" cy="170" rx="25" ry="15" fill="white" />
      
      {/* Window */}
      <rect x="300" y="50" width="120" height="100" fill="#87CEEB" />
      <rect x="300" y="50" width="120" height="4" fill="#8B4513" />
      <rect x="358" y="50" width="4" height="100" fill="#8B4513" />
      
      {/* Bookshelf */}
      <rect x="450" y="100" width="40" height="150" fill="#8B4513" />
      <rect x="452" y="125" width="36" height="4" fill="#654321" />
      <rect x="452" y="175" width="36" height="4" fill="#654321" />
      <rect x="452" y="225" width="36" height="4" fill="#654321" />
      
      {/* Books */}
      <rect x="454" y="105" width="6" height="18" fill={hasDifference('book-color') ? "#00FF00" : "#FF0000"} />
      <rect x="462" y="105" width="6" height="18" fill="#0000FF" />
      <rect x="470" y="105" width="6" height="18" fill="#FFFF00" />
      
      {/* Rug */}
      <ellipse cx="200" cy="350" rx="80" ry="30" fill={hasDifference('rug-pattern') ? "#FF69B4" : "#800080"} />
      
      {/* Toy box */}
      <rect x="250" y="260" width="60" height="40" fill="#8B4513" />
      {hasDifference('extra-toy') && (
        <circle cx="280" cy="250" r="8" fill="#FF0000" />
      )}
      
      {/* Wall stickers */}
      {!hasDifference('missing-sticker') && (
        <polygon points="380,180 390,160 400,180" fill="#FFD700" />
      )}
      <circle cx="350" cy="200" r="8" fill="#FF69B4" />
    </svg>
  );

  const renderKitchenScene = () => (
    <svg width={width} height={height} viewBox="0 0 500 400" className="border-2 border-gray-300 rounded-lg">
      {/* Background */}
      <rect width="500" height="400" fill="#F0F8FF" />
      
      {/* Counter */}
      <rect x="0" y="250" width="500" height="150" fill="#8B4513" />
      <rect x="0" y="250" width="500" height="20" fill="#DEB887" />
      
      {/* Cabinets */}
      <rect x="50" y="100" width="80" height="150" fill="#654321" />
      <rect x="150" y="100" width="80" height="150" fill="#654321" />
      <rect x="350" y="100" width="80" height="150" fill="#654321" />
      
      {/* Cabinet handles */}
      <circle cx="120" cy="175" r="3" fill="#FFD700" />
      <circle cx="220" cy="175" r="3" fill="#FFD700" />
      <circle cx="420" cy="175" r="3" fill="#FFD700" />
      
      {/* Bowl */}
      <ellipse cx="200" cy="240" rx="30" ry="15" fill={hasDifference('bowl-color') ? "#FF69B4" : "#FFFFFF"} />
      
      {/* Fruits */}
      {!hasDifference('missing-fruit') && (
        <circle cx="150" cy="235" r="12" fill="#FF0000" /> // Apple
      )}
      <circle cx="250" cy="235" r="10" fill="#FFA500" /> // Orange
      
      {/* Cutting board */}
      <rect x="300" y="230" width="60" height="40" fill={hasDifference('board-color') ? "#654321" : "#DEB887"} rx="5" />
      
      {/* Knife */}
      <rect x="320" y="225" width="20" height="4" fill="#C0C0C0" />
      <rect x="340" y="223" width="8" height="8" fill="#8B4513" />
      
      {/* Spoons */}
      {hasDifference('extra-spoon') && (
        <ellipse cx="400" cy="235" rx="3" ry="12" fill="#C0C0C0" />
      )}
      
      {/* Ingredient containers */}
      {!hasDifference('missing-ingredient') && (
        <rect x="80" y="220" width="20" height="30" fill="#FFFF00" />
      )}
      
      {/* Kitchen tools */}
      {hasDifference('extra-tool') && (
        <rect x="450" y="225" width="6" height="25" fill="#8B4513" />
      )}
      
      {/* Napkin */}
      {!hasDifference('missing-napkin') && (
        <rect x="120" y="260" width="25" height="20" fill="#FFB6C1" />
      )}
      
      {/* Plate */}
      <circle cx="180" cy="280" r="20" fill={hasDifference('plate-pattern') ? "#FF69B4" : "#FFFFFF"} />
    </svg>
  );

  const renderToysScene = () => (
    <svg width={width} height={height} viewBox="0 0 500 400" className="border-2 border-gray-300 rounded-lg">
      {/* Background */}
      <rect width="500" height="400" fill="#E6E6FA" />
      
      {/* Toy blocks */}
      {!hasDifference('missing-block') && (
        <rect x="100" y="200" width="40" height="40" fill="#FF0000" />
      )}
      <rect x="150" y="200" width="40" height="40" fill="#00FF00" />
      <rect x="200" y="200" width="40" height="40" fill="#0000FF" />
      
      {/* Ball */}
      <circle cx="300" cy="220" r="25" fill={hasDifference('ball-color') ? "#FF69B4" : "#FFFF00"} />
      
      {/* Teddy bear */}
      <ellipse cx="400" cy="180" rx="20" ry="25" fill="#8B4513" />
      <circle cx="400" cy="160" r="15" fill="#8B4513" />
      <circle cx="395" cy="155" r="2" fill="#000" />
      <circle cx="405" cy="155" r="2" fill="#000" />
      
      {/* Extra teddy bear */}
      {hasDifference('extra-bear') && (
        <>
          <ellipse cx="150" cy="320" rx="15" ry="20" fill="#DEB887" />
          <circle cx="150" cy="305" r="12" fill="#DEB887" />
          <circle cx="146" cy="302" r="1.5" fill="#000" />
          <circle cx="154" cy="302" r="1.5" fill="#000" />
        </>
      )}
      
      {/* Toy car */}
      <rect x="50" y="300" width="60" height="30" fill={hasDifference('car-color') ? "#FF0000" : "#0000FF"} rx="5" />
      <circle cx="65" cy="340" r="8" fill="#000" />
      <circle cx="95" cy="340" r="8" fill="#000" />
      
      {/* Building blocks tower */}
      <rect x="350" y="280" width="30" height="20" fill="#FF4500" />
      <rect x="350" y="260" width="30" height="20" fill="#32CD32" />
      <rect x="350" y="240" width="30" height="20" fill="#FF69B4" />
      
      {/* Toy airplane */}
      {hasDifference('extra-plane') && (
        <>
          <ellipse cx="250" cy="120" rx="25" ry="8" fill="#87CEEB" />
          <rect x="235" y="116" width="30" height="8" fill="#87CEEB" />
        </>
      )}
    </svg>
  );

  const renderClassroomScene = () => (
    <svg width={width} height={height} viewBox="0 0 500 400" className="border-2 border-gray-300 rounded-lg">
      {/* Background */}
      <rect width="500" height="400" fill="#F5F5DC" />
      
      {/* Blackboard */}
      <rect x="50" y="50" width="200" height="120" fill="#2F4F4F" />
      <rect x="52" y="52" width="196" height="116" fill="#000" />
      
      {/* Desk */}
      <rect x="300" y="200" width="120" height="60" fill="#8B4513" />
      <rect x="310" y="190" width="100" height="10" fill="#DEB887" />
      
      {/* Chair */}
      <rect x="350" y="140" width="40" height="50" fill={hasDifference('chair-color') ? "#FF69B4" : "#8B4513"} />
      <rect x="355" y="120" width="30" height="20" fill={hasDifference('chair-color') ? "#FF69B4" : "#8B4513"} />
      
      {/* Books */}
      <rect x="320" y="180" width="8" height="12" fill={hasDifference('book-spine') ? "#00FF00" : "#FF0000"} />
      <rect x="330" y="180" width="8" height="12" fill="#0000FF" />
      <rect x="340" y="180" width="8" height="12" fill="#FFFF00" />
      
      {/* Pencils */}
      {!hasDifference('missing-pencil') && (
        <rect x="380" y="185" width="2" height="15" fill="#FFD700" />
      )}
      <rect x="385" y="185" width="2" height="15" fill="#FF69B4" />
      
      {/* Eraser */}
      {hasDifference('extra-eraser') && (
        <rect x="395" y="188" width="8" height="4" fill="#FF69B4" />
      )}
      
      {/* Apple */}
      {hasDifference('extra-apple') && (
        <circle cx="360" cy="175" r="8" fill="#FF0000" />
      )}
      
      {/* Wall poster */}
      {!hasDifference('missing-poster') && (
        <rect x="400" y="80" width="80" height="60" fill="#FFB6C1" />
      )}
      
      {/* Clock */}
      <circle cx="450" cy="200" r="25" fill="white" stroke="#000" strokeWidth="2" />
      <line x1="450" y1="200" x2="450" y2="185" stroke="#000" strokeWidth="2" />
      <line x1="450" y1="200" x2="460" y2="200" stroke="#000" strokeWidth="1" />
      {hasDifference('missing-clock-hand') && (
        <line x1="450" y1="200" x2="445" y2="190" stroke="#000" strokeWidth="1" />
      )}
    </svg>
  );

  const renderGardenScene = () => (
    <svg width={width} height={height} viewBox="0 0 500 400" className="border-2 border-gray-300 rounded-lg">
      {/* Sky */}
      <rect width="500" height="200" fill="#87CEEB" />
      
      {/* Ground */}
      <rect y="200" width="500" height="200" fill="#90EE90" />
      
      {/* Sun */}
      <circle cx="450" cy="50" r="30" fill="#FFD700" />
      
      {/* Tree */}
      <rect x="80" y="120" width="20" height="80" fill="#8B4513" />
      <circle cx="90" cy="110" r="40" fill="#228B22" />
      
      {/* Flowers */}
      <circle cx="150" cy="280" r="8" fill={hasDifference('flower1-color') ? "#FF69B4" : "#FF0000"} />
      <rect x="147" y="280" width="6" height="20" fill="#228B22" />
      
      <circle cx="200" cy="290" r="8" fill="#FFFF00" />
      <rect x="197" y="290" width="6" height="20" fill="#228B22" />
      
      {hasDifference('extra-flower') && (
        <>
          <circle cx="250" cy="285" r="8" fill="#FF69B4" />
          <rect x="247" y="285" width="6" height="20" fill="#228B22" />
        </>
      )}
      
      {/* Butterfly */}
      {hasDifference('extra-butterfly') && (
        <>
          <ellipse cx="180" cy="150" rx="8" ry="4" fill="#FF69B4" />
          <ellipse cx="190" cy="150" rx="8" ry="4" fill="#FF69B4" />
          <line x1="185" y1="150" x2="185" y2="140" stroke="#000" strokeWidth="1" />
        </>
      )}
      
      {/* Garden path */}
      <ellipse cx="300" cy="350" rx="100" ry="30" fill="#D2B48C" />
      
      {/* Watering can */}
      {!hasDifference('missing-watering-can') && (
        <>
          <ellipse cx="350" cy="300" rx="15" ry="10" fill="#C0C0C0" />
          <rect x="365" y="295" width="20" height="4" fill="#C0C0C0" />
        </>
      )}
      
      {/* Fence */}
      <rect x="400" y="180" width="4" height="60" fill="#8B4513" />
      <rect x="420" y="180" width="4" height="60" fill="#8B4513" />
      <rect x="440" y="180" width="4" height="60" fill="#8B4513" />
      <rect x="400" y="200" width="44" height="4" fill="#8B4513" />
      <rect x="400" y="220" width="44" height="4" fill="#8B4513" />
    </svg>
  );

  const sceneRenderers = {
    playground: renderPlaygroundScene,
    bedroom: renderBedroomScene,
    kitchen: renderKitchenScene,
    toys: renderToysScene,
    classroom: renderClassroomScene,
    garden: renderGardenScene,
  };

  return (
    <div className="inline-block">
      {sceneRenderers[sceneType]()}
    </div>
  );
};

export default SimpleCartoonScene;