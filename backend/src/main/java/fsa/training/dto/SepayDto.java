package fsa.training.dto;

import java.math.BigDecimal;

public class SepayDto {
    private long id; // Sepay Gateway ID
    private String gateway; // bank name (e.g. MBBank)
    private String transactionDate; // yyyy-MM-dd HH:mm:ss
    private String accountNumber; // Bank account number
    private String code; // Payment content/syntax
    private String content; // Full transfer content
    private String transferType; // in/out
    private double transferAmount; // Amount
    private long accumuated; // Accumulated balance
    private String subAccount; // Sub account if any
    private String referenceCode; // Reference code
    private String description; // Description

    // Getters and Setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getGateway() {
        return gateway;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTransferType() {
        return transferType;
    }

    public void setTransferType(String transferType) {
        this.transferType = transferType;
    }

    public double getTransferAmount() {
        return transferAmount;
    }

    public void setTransferAmount(double transferAmount) {
        this.transferAmount = transferAmount;
    }

    public long getAccumuated() {
        return accumuated;
    }

    public void setAccumuated(long accumuated) {
        this.accumuated = accumuated;
    }

    public String getSubAccount() {
        return subAccount;
    }

    public void setSubAccount(String subAccount) {
        this.subAccount = subAccount;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
