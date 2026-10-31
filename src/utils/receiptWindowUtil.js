import { formatReceiptDateTime } from "@/utils/formattingUtils";
export const openReceiptTab = (receipt) => {
    if (!receipt) return;

    const itemsHtml = (receipt.items || []).map(item => `
        <tr>
            <td style="padding: 4px 0; border-bottom: 1px dashed #ccc;">${item.productName}</td>
            <td style="text-align: center; padding: 4px 0; border-bottom: 1px dashed #ccc;">${item.quantity}</td>
            <td style="text-align: right; padding: 4px 0; border-bottom: 1px dashed #ccc;">₱${Number(item.unitPrice).toFixed(2)}</td>
            <td style="text-align: right; padding: 4px 0; border-bottom: 1px dashed #ccc;">₱${Number(item.totalPrice).toFixed(2)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${receipt.receiptNumber}</title>
            <style>
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    width: 58mm; 
                    margin: 20px auto; 
                    padding: 10px; 
                    font-size: 11px; 
                    color: #000; 
                    background: #fff;
                }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { border-bottom: 1px dashed #000; text-align: left; padding-bottom: 4px; font-size: 10px; }
                .line { border-top: 1px dashed #000; margin: 8px 0; }
                .flex { display: flex; justify-content: space-between; }
                .action-buttons { margin-top: 20px; text-align: center; }
                .btn { 
                    width: 100%; 
                    padding: 10px; 
                    background: #000; 
                    color: #fff; 
                    border: none; 
                    font-weight: bold; 
                    cursor: pointer; 
                    border-radius: 4px;
                    font-family: inherit;
                }
                .btn:hover { background: #333; }
                @media print { 
                    .action-buttons { display: none; } 
                    body { margin: 0; width: 100%; }
                }
            </style>
        </head>
        <body>
            <div class="center">
                <span class="bold" style="font-size: 13px;">FRANCO'S PERFUME</span><br>
                <span>${receipt.branch}</span><br>
                <span>Receipt: #${receipt.receiptNumber}</span><br>
                <span>Date: ${formatReceiptDateTime(receipt.transactionDate)}</span><br>
                <span>Cashier: ${receipt.employeeName} (${receipt.employeeId})</span>
            </div>
            
            <div class="line"></div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="center">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="line"></div>
            
            <div>
                <div class="flex"><span>Subtotal:</span><span>₱${Number(receipt.subtotal).toFixed(2)}</span></div>
                <div class="flex"><span>Discount:</span><span>₱${Number(receipt.discountAmount || 0).toFixed(2)}</span></div>
                <div class="flex"><span>Vatable Sales:</span><span>₱${Number(receipt.vatableSales || 0).toFixed(2)}</span></div>
                <div class="flex"><span>VAT (12%):</span><span>₱${Number(receipt.vatAmount).toFixed(2)}</span></div>
                <div class="flex bold" style="margin-top: 4px; font-size: 12px;"><span>TOTAL:</span><span>₱${Number(receipt.total).toFixed(2)}</span></div>
            </div>
            
            <div class="line"></div>
            
            <div>
                <span>Method: ${receipt.paymentMethod}</span><br>
                <span>Paid: ₱${Number(receipt.amountPaid).toFixed(2)}</span><br>
                <span>Change: ₱${Number(receipt.change).toFixed(2)}</span><br>
                <span style="font-size: 9px; color: #555;">Txn ID: ${receipt.transactionId}</span>
            </div>
            
            <div class="line"></div>
            
            <div class="center">
                <span>Thank you for shopping!</span><br>
                <span>Please come again.</span>
            </div>

            <div class="action-buttons">
                <button class="btn" onclick="window.print()">Print / Save as PDF</button>
            </div>
        </body>
        </html>
    `;

    // Open a new browser tab/window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    }
};