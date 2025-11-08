import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Returns & Exchanges</h1>
      <p className="mt-2 text-slate-700">
        We want every order to land perfectly—but if something’s off, we’ll make it right.
        Here is how returns and exchanges work at LuvBricks:
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-8 text-med text-slate-700">
        {/* Main Content */}
        <div className="space-y-6">
          <p>
            You may return any <strong>unopened, unused</strong> product within <strong>30 days</strong> of delivery.
            To start a return, just <Link href="/customer-service/contact" className="text-blue-700 font-medium hover:underline">contact us</Link> first—we’ll walk you through the quick steps.
            Returned items must arrive in original condition with all packaging intact. Opened LEGO sets (even if complete) are not eligible for return.
          </p>

          <p>
            If your order arrives damaged, we offer a <strong>same-product exchange</strong>—no guesswork, no hassle.
            Just reach out within a few days of delivery with a photo of the damage, and we’ll take it from there.
            If the item is out of stock, we’ll offer the closest available resolution.
          </p>

          <p>
            Customers cover return shipping, and original shipping charges are non-refundable.
            For safe return delivery, we recommend using a trackable service.
            We do not ship internationally at this time, and can only accept returns from <strong>U.S. orders</strong>.
          </p>

          <p>
            If a refund is agreed upon, once your return arrives, refunds are issued to your original payment method within <strong>72 hours</strong>.
            You’ll receive a confirmation email when it’s processed. Shipping and tax charges are non-refundable.
            Questions along the way? <Link href="/customer-service/contact" className="text-blue-700 font-medium hover:underline">Contact our team</Link>—we’re happy to help.
          </p>

          {/* FAQ Accordion */}
          <div className="mt-10">
            <h2 className="text-base font-semibold text-slate-900">Common Questions</h2>
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="q1">
                <AccordionTrigger>Can I return a LEGO set after opening it?</AccordionTrigger>
                <AccordionContent>
                  Unfortunately, no. We only accept returns for unopened items in their original condition.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How do I request an exchange for a damaged item?</AccordionTrigger>
                <AccordionContent>
                  Visit our <Link href="/customer-service/contact" className="text-blue-700 hover:underline">Contact</Link> page and send us a photo of the damage within a few days of receiving your package. We will replace the item if it is still in stock.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Do I need to use a specific shipping method for my return?</AccordionTrigger>
                <AccordionContent>
                  Any method is fine, but we strongly recommend a trackable option like USPS Ground Advantage or UPS Ground. We can’t guarantee receipt without tracking.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Sidebar Tips */}
        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm">
          <div className="font-semibold text-slate-900 mb-2">Helpful Tips</div>
          <ul className="list-disc pl-4 space-y-2 text-slate-700">
            <li>Keep your packing slip until your return is complete.</li>
            <li>Returns must include all original packaging (bags, box, etc.).</li>
            <li>We process refunds within 72 hours of receiving your return.</li>
            <li>Reach out if you’re unsure—our team is here to help.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
