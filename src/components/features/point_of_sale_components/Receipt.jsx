import { formatReceiptDateTime } from "@/utils/formattingUtils";
const Receipt = ({ receipt }) => {
    if (!receipt) return null;

    return (
        <div id="printable-receipt" style={{ display: 'none' }}>
            <div style={{
                width: '58mm',
                margin: '0 auto',
                padding: '10px',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '11px',
                color: '#000',
                backgroundColor: '#fff',
                lineHeight: '1.3'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <b style={{ fontSize: '13px' }}>FRANCO'S PERFUME</b><br />
                    <span>{receipt.branch}</span><br />
                    <span>Receipt: #{receipt.receiptNumber}</span><br />
                    <span>Date: {formatReceiptDateTime(receipt.transactionDate)}</span><br />
                    <span>Cashier: {receipt.employeeName} ({receipt.employeeId})</span>
                </div>

                <div>--------------------------------</div>

                {/* Items List */}
                <div style={{ margin: '6px 0' }}>
                    {receipt.items?.map((item, index) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                            <div><b>{item.productName}</b></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.quantity} x ₱{Number(item.unitPrice).toFixed(2)}</span>
                                <span>₱{Number(item.totalPrice).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div>--------------------------------</div>

                {/* Totals Section */}
                <div style={{ margin: '6px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>₱{Number(receipt.subtotal).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Discount:</span>
                        <span>₱{Number(receipt.discountAmount || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vatable Sales:</span>
                        <span>₱{Number(receipt.vatableSales || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>VAT (12%):</span>
                        <span>₱{Number(receipt.vatAmount).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
                        <span>TOTAL:</span>
                        <span>₱{Number(receipt.total).toFixed(2)}</span>
                    </div>
                </div>

                <div>--------------------------------</div>
                
                {/* Payment Section */}
                <div style={{ margin: '6px 0' }}>
                    <span>Method: {receipt.paymentMethod}</span><br />
                    <span>Paid: ₱{Number(receipt.amountPaid).toFixed(2)}</span><br />
                    <span>Change: ₱{Number(receipt.change).toFixed(2)}</span><br />
                    <span style={{ fontSize: '9px', color: '#555' }}>Txn ID: {receipt.transactionId}</span>
                </div>

                <div>--------------------------------</div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <span>Thank you for shopping!</span><br />
                    <span>Please come again.</span>
                </div>
            </div>
        </div>
    );
};

export default Receipt;