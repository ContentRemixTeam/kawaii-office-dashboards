import React from 'react';

export default function BeeGlassesTest() {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-background">
      <h2 className="text-2xl font-bold text-foreground">Bee + Glasses Alignment Test</h2>
      
      <div className="flex gap-8">
        {/* Bee only */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Bee Base Only</h3>
          <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
            <img 
              src="/characters/bases/bee/bee-base.png" 
              alt="Bee base" 
              className="w-24 h-24 object-contain"
              onError={(e) => {
                console.error('Failed to load bee image:', e);
                e.currentTarget.style.border = '2px solid red';
              }}
              onLoad={() => console.log('Bee image loaded successfully')}
            />
          </div>
        </div>

        {/* Bee with glasses overlay */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Bee + Glasses</h3>
          <div className="relative w-64 h-64 border-2 border-dashed border-muted-foreground rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50">
            {/* Bee base - positioned absolutely and centered */}
            <img 
              src="/characters/bases/bee/bee-base.png" 
              alt="Bee base" 
              className="absolute w-56 h-56 object-contain"
              style={{ 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1 
              }}
              onError={(e) => {
                console.error('Failed to load bee image in overlay:', e);
                e.currentTarget.style.border = '3px solid red';
              }}
              onLoad={() => console.log('Bee overlay image loaded successfully')}
            />
            {/* Glasses overlay - positioned on bee's face */}
            <img 
              src="/characters/customization/accessories/glasses-round.png" 
              alt="Glasses" 
              className="absolute w-32 h-32 object-contain"
              style={{ 
                top: '42%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 2
              }}
              onError={(e) => {
                console.error('Failed to load glasses image in overlay:', e);
                e.currentTarget.style.border = '3px solid blue';
              }}
              onLoad={() => console.log('Glasses overlay image loaded successfully')}
            />
          </div>
        </div>

        {/* Glasses only for reference */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Glasses Only</h3>
          <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
            <img 
              src="/characters/customization/accessories/glasses-round.png" 
              alt="Glasses" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Interactive positioning test */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Interactive Position Test</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hover to see different positioning options
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Default', transform: 'translate-y-[-2px]' },
            { label: 'Higher', transform: 'translate-y-[-6px]' },
            { label: 'Lower', transform: 'translate-y-[2px]' },
          ].map(({ label, transform }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-medium mb-2 text-foreground">{label}</p>
              <div className="relative w-24 h-24 border border-muted rounded-lg flex items-center justify-center mx-auto hover:border-primary transition-colors">
                <img 
                  src="/characters/bases/bee/bee-base.png" 
                  alt="Bee base" 
                  className="absolute w-20 h-20 object-contain z-10"
                  onError={(e) => {
                    console.error(`Failed to load bee image in ${label}:`, e);
                    e.currentTarget.style.border = '1px solid red';
                  }}
                />
                <img 
                  src="/characters/customization/accessories/glasses-round.png" 
                  alt="Glasses" 
                  className={`absolute w-14 h-14 object-contain z-20 transform ${transform}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}