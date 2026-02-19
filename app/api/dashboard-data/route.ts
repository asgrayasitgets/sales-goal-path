{tab === "monthly" && (
  <>
    <Card
      label={`Revenue (${data?.monthly?.month ?? "This Month"})`}
      value={`${formatMoney(data?.monthly?.actualRevenue ?? null)} / ${formatMoney(
        data?.monthly?.targetRevenue ?? null
      )}`}
    />
    <Card
      label={`Quotes Completed (${data?.monthly?.month ?? "This Month"})`}
      value={`${formatInt(data?.monthly?.actualQuotesCount ?? null)} / ${formatInt(
        data?.monthly?.targetQuotesCount ?? null
      )}`}
    />
  </>
)}

{tab === "weekly" && (
  <>
    <Card
      label={`Revenue (Week Ending ${data?.weekly?.weekEnding ?? ""})`}
      value={`${formatMoney(data?.weekly?.actualRevenue ?? null)} / ${formatMoney(
        data?.weekly?.targetRevenue ?? null
      )}`}
    />
    <Card
      label={`Quotes Completed (Week Ending ${data?.weekly?.weekEnding ?? ""})`}
      value={`${formatInt(data?.weekly?.actualQuotesCount ?? null)} / ${formatInt(
        data?.weekly?.targetQuotesCount ?? null
      )}`}
    />
  </>
)}
