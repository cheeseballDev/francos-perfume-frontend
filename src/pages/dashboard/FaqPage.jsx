import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, HelpCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqData = [
  {
    category: "Account & Security",
    questions: [
      {
        q: "How do I change my temporary password?",
        a: "When logging in with a temporary password, the system will automatically prompt you to enter and confirm a new secure password before granting access to your dashboard or the POS."
      },
      {
        q: "What is the difference between Cashier and Manager modules?",
        a: "The Cashier module strictly handles POS transactions, cart management, and applying discounts. The Manager module gives you access to the dashboard to monitor sales, process inventory requests, and track branch performance."
      }
    ]
  },
  {
    category: "Point of Sale (POS)",
    questions: [
      {
        q: "Does the inventory stock update automatically after a sale?",
        a: "Yes. Once a payment is confirmed and the receipt is generated, the system instantly deducts the stock from the oldest available batches (FIFO) and refreshes the POS screen in real-time."
      },
      {
        q: "How do I apply a discount to an order?",
        a: "Before clicking Payment, click the 'Discount' button below the order summary. You can select an applicable discount rate which will automatically deduct from the subtotal."
      }
    ]
  },
  {
    category: "Inventory & Transfers",
    questions: [
      {
        q: "How do I request stock from another branch?",
        a: "Navigate to the Requests page and click 'New Request'. Select the branch you are requesting from, add the specific products and quantities, and submit. The target branch must approve it before stock is moved."
      },
      {
        q: "Why can't I see the total quantity editable in the main inventory table?",
        a: "Total inventory quantity is strictly calculated by summing up individual batch deliveries. To increase stock, you must receive a new delivery batch or an approved branch transfer."
      }
    ]
  }
];

const FaqPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter FAQs based on search query
  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background font-montserrat p-6 md:p-12 text-foreground">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <HelpCircle size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about OneFrancoScentHub</p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-full py-4 pl-12 pr-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        <div className="space-y-8">
          {filteredData.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No results found for "{searchQuery}". Try a different keyword.
            </div>
          ) : (
            filteredData.map((category, catIndex) => (
              <div key={catIndex} className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-4 text-foreground border-b border-border pb-2">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((item, qIndex) => {
                    const isOpen = openItems[`${catIndex}-${qIndex}`];
                    return (
                      <div 
                        key={qIndex} 
                        className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 shadow-sm hover:border-primary/50"
                      >
                        <button
                          onClick={() => toggleItem(catIndex, qIndex)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold focus:outline-none"
                        >
                          <span className="pr-4">{item.q}</span>
                          <span className="text-muted-foreground shrink-0">
                            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </span>
                        </button>
                        
                        {isOpen && (
                          <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-border/50 bg-muted/20">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;