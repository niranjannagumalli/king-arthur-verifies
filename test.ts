import { getSpreadsheet } from "./sheet.ts"; // import your helper
// ... other imports remain unchanged ...

async function home(request: Request) {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { valid, body } = await verifySignature(request);
  if (!valid) {
    return json({ error: "Invalid request" }, { status: 401 });
  }

  const { type = 0, data = { options: [] } } = JSON.parse(body);

  if (type === 1) {
    return json({ type: 1 });
  }

  if (type === 2) {
    const emailOption = data.options.find((option) => option.name === "name");
    if (!emailOption) {
      return json({
        type: 4,
        data: { content: "Please provide an email." },
      });
    }

    const email = emailOption.value;
    const name = await findNameByEmail(email);

    return json({
      type: 4,
      data: {
        content: name
          ? `The name associated with ${email} is ${name}.`
          : `No user found with email ${email}.`,
      },
    });
  }

  return json({ error: "bad request" }, { status: 400 });
}

async function findNameByEmail(email: string): Promise<string | null> {
  const sheet = await getSpreadsheet();
  await sheet.loadInfo();
  const ws = sheet.sheetsByIndex[0];
  const rows = await ws.getRows();

  const match = rows.find((row) => row.get("email") === email);
  return match ? row.get("name") : null;
}
