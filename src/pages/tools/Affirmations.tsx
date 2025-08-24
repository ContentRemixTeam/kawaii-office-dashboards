import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCw, Calendar, Heart } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import { getDailyData, setDailyData, safeGet, safeSet } from "@/lib/storage";
import { notifyDataChanged } from "@/lib/bus";

const AFFIRMATIONS = [
  "I am worthy of love and happiness",
  "I choose peace over perfection today",
  "My potential is limitless",
  "I trust in my ability to overcome challenges",
  "I am grateful for this moment",
  "I radiate positivity and attract abundance",
  "I am exactly where I need to be",
  "My dreams are valid and achievable",
  "I choose to see beauty in small moments",
  "I am strong, capable, and resilient",
  "I deserve all the good things coming my way",
  "I trust the process of my life",
  "I am open to new possibilities",
  "My inner wisdom guides me",
  "I celebrate my progress, no matter how small",
  "I am enough, just as I am",
  "I choose love over fear",
  "I am creating a life I love",
  "My heart is open to giving and receiving",
  "I find strength in my vulnerability",
  "I am aligned with my highest purpose",
  "I trust my intuition",
  "I am grateful for my unique journey",
  "I choose joy in this moment",
  "I am constantly growing and evolving",
  "My presence makes a difference",
  "I honor my feelings and needs",
  "I am worthy of my dreams",
  "I choose compassion for myself and others",
  "I am connected to infinite possibilities",
  "My creativity flows freely",
  "I trust in divine timing",
  "I am learning and growing every day",
  "I choose to be gentle with myself",
  "I am surrounded by love and support",
  "My life has meaning and purpose",
  "I embrace change as growth",
  "I am proud of how far I've come",
  "I choose hope over worry",
  "I am worthy of success and happiness",
  "My spirit is unbreakable",
  "I find peace in the present moment",
  "I am enough, I have enough, I do enough",
  "I choose to shine my light brightly",
  "I trust that everything works out for my highest good",
  "I am grateful for my body and all it does for me",
  "I choose love in every situation",
  "My heart is full of gratitude",
  "I am exactly who I'm meant to be",
  "I trust my path, even when it's unclear"
];

interface DailyCard {
  date: string;
  cardIndex: number;
  text: string;
}

interface CardHistory {
  [date: string]: DailyCard;
}

export default function Affirmations() {
  const [todaysCard, setTodaysCard] = useState<DailyCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [cardHistory, setCardHistory] = useState<CardHistory>({});
  const [isCardRevealed, setIsCardRevealed] = useState(false);

  useEffect(() => {
    // Load today's card if already drawn
    const existingCard = getDailyData<DailyCard | null>("fm_affirmations_v1", null);
    if (existingCard) {
      setTodaysCard(existingCard);
      setHasDrawnToday(true);
      setIsCardRevealed(true);
    }

    // Load card history
    const history = safeGet<CardHistory>("fm_affirmation_history_v1", {});
    setCardHistory(history);
  }, []);

  const drawDailyCard = () => {
    if (hasDrawnToday) return;

    setIsFlipping(true);
    
    // Generate random card
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    const today = new Date().toISOString().split('T')[0];
    const newCard: DailyCard = {
      date: today,
      cardIndex: randomIndex,
      text: AFFIRMATIONS[randomIndex]
    };

    setTimeout(() => {
      setTodaysCard(newCard);
      setDailyData("fm_affirmations_v1", newCard);
      
      // Save to history
      const updatedHistory = { ...cardHistory, [today]: newCard };
      setCardHistory(updatedHistory);
      safeSet("fm_affirmation_history_v1", updatedHistory);
      
      setHasDrawnToday(true);
      setIsCardRevealed(true);
      setIsFlipping(false);

      // Dispatch events for real-time updates
      window.dispatchEvent(new CustomEvent('affirmationUpdated'));
      window.dispatchEvent(new Event('storage'));
      notifyDataChanged(["fm_affirmations_v1"]);
    }, 1000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const sortedHistory = Object.values(cardHistory).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ToolShell title="Affirmation Cards">
      <div className="space-y-6">
        <div className="bg-gradient-peach rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-accent-foreground mb-3">🃏 Daily Inspiration</h2>
          <p className="text-accent-foreground/80">
            Draw a beautiful affirmation card each day to set positive intentions and remind yourself of your inner strength and worth.
          </p>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">🌸 Daily Draw</TabsTrigger>
            <TabsTrigger value="collection">📚 Collection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-6">
            <div className="flex flex-col items-center space-y-6">
              {!hasDrawnToday ? (
                <div className="text-center space-y-4">
                  <div className="w-72 h-96 mx-auto perspective-1000">
                    <div 
                      className={`relative w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
                        isFlipping ? 'rotate-y-180' : ''
                      }`}
                    >
                      <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-kawaii border-2 border-primary/20 shadow-cute">
                        <CardContent className="flex items-center justify-center h-full p-6">
                          <div className="text-center">
                            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-primary-foreground mb-2">
                              Your Daily Affirmation
                            </h3>
                            <p className="text-primary-foreground/80 text-sm">
                              Click to reveal today's inspiration
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={drawDailyCard}
                    disabled={isFlipping}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isFlipping ? (
                      <>
                        <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                        Drawing Card...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Draw Daily Card
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                todaysCard && (
                  <div className="text-center space-y-4">
                    <Badge variant="secondary" className="mb-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      Today's Card
                    </Badge>
                    
                    <Card className="w-72 h-96 mx-auto bg-gradient-kawaii border-2 border-primary/20 shadow-cute">
                      <CardContent className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
                          <blockquote className="text-lg font-medium text-primary-foreground leading-relaxed">
                            "{todaysCard.text}"
                          </blockquote>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <p className="text-muted-foreground text-sm">
                      Come back tomorrow for a new affirmation
                    </p>
                  </div>
                )
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="collection" className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Your Affirmation Journey</h3>
              <p className="text-muted-foreground text-sm">
                Revisit the wisdom that has guided your days
              </p>
            </div>
            
            {sortedHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Cards Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Draw your first daily affirmation card to start building your collection
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sortedHistory.map((card) => (
                  <Card key={card.date} className="p-4 border border-border/20 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {formatDate(card.date)}
                          </p>
                          <blockquote className="text-foreground leading-relaxed">
                            "{card.text}"
                          </blockquote>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ToolShell>
  );
}