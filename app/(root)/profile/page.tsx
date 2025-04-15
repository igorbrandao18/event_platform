import { auth } from "@clerk/nextjs";
import { getOrdersByUser } from "@/lib/actions/order.actions";
import { getEventsByUser } from "@/lib/actions/event.actions";
import { IOrder } from "@/lib/database/models/order.model";
import { IEvent } from "@/lib/database/models/event.model";
import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchParamProps } from '@/types'
import { redirect } from "next/navigation";

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims, userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const eventsPage = Number(searchParams?.eventsPage) || 1;

  let orders;
  let organizedEvents;

  try {
    [orders, organizedEvents] = await Promise.all([
      getOrdersByUser({ userId, page: ordersPage }),
      getEventsByUser({ userId, page: eventsPage })
    ]);
  } catch (error) {
    console.error('Error fetching profile data:', error);
    orders = { data: [], totalPages: 0 };
    organizedEvents = { data: [], totalPages: 0 };
  }

  const orderedEvents = orders?.data.map((order: IOrder) => {
    const event = order.event as unknown as IEvent;
    return {
      _id: event._id,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      imageUrl: event.imageUrl,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      price: event.price || '0',
      isFree: event.isFree || false,
      url: event.url || '',
      category: {
        _id: event.category._id.toString(),
        name: event.category.name
      },
      organizer: {
        _id: event.organizer._id.toString(),
        firstName: event.organizer.firstName,
        lastName: event.organizer.lastName
      }
    } as IEvent;
  }) || [];

  return (
    <>
      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/#events">Explore More Events</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>

      {/* Events Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/events/create">Create New Event</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data || []}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages || 0}
        />
      </section>
    </>
  );
};

export default ProfilePage;