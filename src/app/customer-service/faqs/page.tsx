import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FAQS = [
  { q: "When will my order ship?", a: "Orders placed Mon–Fri ship within 24 hours. Weekend orders ship Monday." },
  { q: "Which carriers do you use?", a: "We primarily ship via USPS and UPS. Tracking is provided on all orders." },
  { q: "What is your return policy?", a: "30 days for unopened sets. If there’s an issue with your order, contact us and we’ll make it right." },
  { q: "Do you offer gift receipts?", a: "Yes—leave a note at checkout and we’ll include one without prices." },
];

export default function Page() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="mt-6">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-slate-700">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
