import { StarIcon } from "lucide-react";

interface Review {
  name: string;
  role: string;
  rating: number;
  comment: string;
}

const REVIEWS: Review[] = [
  {
    name: "Rafiqul Islam",
    role: "Construction Manager",
    rating: 5,
    comment:
      "We rented a 20-ton crane for two months on a tight schedule. Booking through GearLoop was smoother than our old rental desk.",
  },
  {
    name: "Sara Ahmed",
    role: "Wedding Photographer",
    rating: 5,
    comment:
      "Needed lighting and audio kit last minute for a wedding. Found everything in one platform and the gear was top quality.",
  },
  {
    name: "Naimul Karim",
    role: "Farm Owner",
    rating: 4,
    comment:
      "Great for seasonal equipment like the rice transplanter. The owner handled delivery to our field office quickly.",
  },
  {
    name: "Mehedi Hasan",
    role: "Event Planner",
    rating: 5,
    comment:
      "Tents, stages and sound for our annual corporate event. Payments were secure and equipment arrived on time.",
  },
  {
    name: "Tania Rahman",
    role: "Interior Designer",
    rating: 5,
    comment:
      "Rented power tools and projectors for a full renovation shoot. The rental flow with favorites saved us hours.",
  },
];

export function Reviews() {
  const avgRating = (
    REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length
  ).toFixed(1);

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle mx-auto">
            Rated {avgRating} out of 5 from real rentals.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <div key={review.name} className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`size-4 ${i < Math.round(review.rating) ? "" : "text-border"} fill-current`}
                  />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                &ldquo;{review.comment}&rdquo;
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
