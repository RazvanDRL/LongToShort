import crypto from 'crypto';

const FGO_API_KEY = process.env.FGO_API_KEY!;
const COD_UNIC = process.env.COD_UNIC!;
const CLIENT_DENUMIRE = process.env.CLIENT_DENUMIRE!;

const generateFGOBill = async () => {
    const hash = crypto.createHash('sha1').update(COD_UNIC + FGO_API_KEY + CLIENT_DENUMIRE).digest('hex').toUpperCase();
    console.log(hash, COD_UNIC, FGO_API_KEY, CLIENT_DENUMIRE);
    const url = 'https://testapp.fgo.ro/publicws/factura/emitere';
    const data = {
        CodUnic: COD_UNIC,
        Hash: hash,
        'Client[Denumire]': CLIENT_DENUMIRE,
        'Client[CodUnic]': COD_UNIC,
        'Client[Tip]': 'PJ',
        'Client[NrRegCom]': '',
        'Client[Judet]': '',
        Text: 'Nume Delegat',
        Serie: 'DRL',
        Explicatii: 'Explicatii factura',
        Valuta: 'RON',
        TipFactura: 'Factura',
        VerificareDuplicat: 'true',
        'Continut[0][Denumire]': 'Produs 1',
        'Continut[0][PretUnitar]': '50',
        'Continut[0][UM]': 'buc',
        'Continut[0][NrProduse]': '1',
        'Continut[0][CotaTVA]': '0',
        PlatformaUrl: "https://www.fgo.ro"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        return responseData;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

generateFGOBill();