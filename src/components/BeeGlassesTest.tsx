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

        {/* Bee with glasses overlay - PROPERLY CENTERED */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Bee + Glasses (Centered)</h3>
          <div className="relative w-64 h-64 border-2 border-dashed border-muted-foreground rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50 overflow-visible">
            {/* Debug info */}
            <div className="absolute top-0 left-0 text-xs text-red-600 z-50 bg-white/80 px-1">
              Container: 256×256px | Bee: centered | Glasses: -10px up
            </div>
            
            {/* Bee base - CENTERED */}
            <img 
              src="/characters/bases/bee/bee-base.png" 
              alt="Bee base" 
              className="absolute object-contain border-2 border-red-500"
              style={{ 
                width: '180px',
                height: '180px',
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1 
              }}
              onError={(e) => {
                console.error('CENTERED BEE FAILED TO LOAD:', e);
                e.currentTarget.style.backgroundColor = 'red';
              }}
              onLoad={() => {
                console.log('CENTERED BEE LOADED - Position: center');
              }}
            />
            
            {/* Glasses overlay - CENTERED then offset upward to sit on bee's eyes */}
            <img 
              src="/characters/customization/accessories/glasses-round.png" 
              alt="Glasses" 
              className="absolute object-contain border-2 border-blue-500"
              style={{ 
                width: '110px',
                height: 'auto',
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -60%)', // -60% moves glasses up to sit on bee's eyes
                zIndex: 2
              }}
              onError={(e) => {
                console.error('CENTERED GLASSES FAILED TO LOAD:', e);
                e.currentTarget.style.backgroundColor = 'blue';
              }}
              onLoad={() => {
                console.log('CENTERED GLASSES LOADED - Position: center + up offset');
              }}
            />
          </div>
        </div>

        {/* Multiple positioning tests */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Position Variations</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Glasses Higher', transform: 'translate(-50%, -70%)' },
              { label: 'Perfect Position', transform: 'translate(-50%, -60%)' },
              { label: 'Glasses Lower', transform: 'translate(-50%, -50%)' },
            ].map(({ label, transform }) => (
              <div key={label} className="text-center">
                <p className="text-xs font-medium mb-2 text-foreground">{label}</p>
                <div className="relative w-32 h-32 border border-muted rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50 mx-auto">
                  {/* Bee base */}
                  <img 
                    src="/characters/bases/bee/bee-base.png" 
                    alt="Bee base" 
                    className="absolute object-contain"
                    style={{ 
                      width: '120px',
                      height: '120px',
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1 
                    }}
                  />
                  {/* Glasses with different positions */}
                  <img 
                    src="/characters/customization/accessories/glasses-round.png" 
                    alt="Glasses" 
                    className="absolute object-contain"
                    style={{ 
                      width: '72px',
                      height: 'auto',
                      top: '50%', 
                      left: '50%', 
                      transform: transform,
                      zIndex: 2
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean version without debug borders */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Final Clean Version</h3>
          <div className="relative w-64 h-64 border-2 border-dashed border-muted-foreground rounded-lg bg-gradient-to-br from-blue-50 to-yellow-50">
            {/* Bee base - clean */}
            <img 
              src="/characters/bases/bee/bee-base.png" 
              alt="Bee base" 
              className="absolute object-contain"
              style={{ 
                width: '180px',
                height: '180px',
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1 
              }}
            />
            {/* Glasses overlay - clean */}
            <img 
              src="/characters/customization/accessories/glasses-round.png" 
              alt="Glasses" 
              className="absolute object-contain"
              style={{ 
                width: '110px',
                height: 'auto',
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -60%)',
                zIndex: 2
              }}
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