import { createLazyRoute } from "@tanstack/react-router";
import { useGetMentorProfile } from "@/api/mentor";
import { Loader2, Star, Globe, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator"; // Unused

const MentorProfilePage = () => {
  const { mentorId } = Route.useParams();
  const { data: mentor, isLoading, error } = useGetMentorProfile(mentorId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-destructive font-medium">Failed to load mentor profile</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero / Header Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar & Key Stats */}
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-2xl font-bold">${mentor.pricePerHour}</span>
                  <span className="text-muted-foreground">/ hour</span>
                </div>
                <Button size="lg" className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all">
                  Book Session
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {mentor.name}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {mentor.biography}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{mentor.avgRating.toFixed(1)}</span>
                  <span>({mentor.totalRatings} reviews)</span>
                </div>
                {/* Simulated location/language data if not in current simple interface, 
                    but Mentor interface has languages/timezone */}
                {mentor.languages && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{mentor.languages.join(", ")}</span>
                  </div>
                )}
                {mentor.timezone && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{mentor.timezone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                {mentor.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - About & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <Card className="border-none shadow-sm bg-card/50">
               <CardHeader>
                  <CardTitle>About Me</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {mentor.biography}
                  </p>
                  
                  {mentor.experience && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Experience
                      </h4>
                      <p className="text-muted-foreground">{mentor.experience}</p>
                    </div>
                  )}
               </CardContent>
            </Card>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Client Reviews</h2>
              <div className="space-y-4">
                {mentor.reviews && mentor.reviews.length > 0 ? (
                  mentor.reviews.map((review) => (
                    <Card key={review.id} className="border-none shadow-sm bg-card/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.userAvatar} alt={review.userName} />
                            <AvatarFallback>{review.userName.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground">{review.userName}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                   <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Availability / Additional Info */}
          <div className="space-y-6">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                 {/* This would be the booking calendar widget in a real app */}
                 <p className="text-sm text-muted-foreground mb-4">
                   Check available slots and book a session directly.
                 </p>
                 <Button className="w-full font-semibold">
                   Check Availability
                 </Button>
                 
                 {mentor.responseTime && (
                   <div className="mt-4 pt-4 border-t text-sm text-center text-muted-foreground">
                     Responds within {mentor.responseTime}
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createLazyRoute("/public/mentors/$mentorId")({
  component: MentorProfilePage,
});
