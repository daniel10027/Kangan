import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { formatDateLong, formatFcfa } from "@kangan/shared";

const COLORS = {
  vertKangan: "#0F3D2E",
  ocre: "#D98E2B",
  creme: "#F6EFE3",
  encre: "#1B1B18",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLORS.encre, fontFamily: "Helvetica" },
  headerBar: { backgroundColor: COLORS.vertKangan, padding: 16, borderRadius: 8, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontFamily: "Helvetica-Bold" },
  headerSubtitle: { color: COLORS.ocre, fontSize: 9, marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6, color: COLORS.vertKangan },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#E5DFD0" },
  label: { color: "#6B6658" },
  value: { fontFamily: "Helvetica-Bold" },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: COLORS.creme, padding: 6, fontFamily: "Helvetica-Bold" },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: "#E5DFD0" },
  col1: { width: "35%" },
  col2: { width: "25%" },
  col3: { width: "20%" },
  col4: { width: "20%", textAlign: "right" },
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalBox: { backgroundColor: COLORS.vertKangan, padding: 12, borderRadius: 8, marginTop: 16 },
  totalText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Helvetica-Bold" },
  verifyText: { fontSize: 8, color: "#6B6658", marginTop: 8 },
});

export interface StatementPdfProps {
  statementNumber: string;
  boxReference: string;
  studentName: string;
  schoolName: string;
  periodStart: string;
  periodEnd: string;
  targetAmount: number;
  total: number;
  transactions: Array<{ created_at: string; type: string; amount: number; operator: string; status: string }>;
  verifyUrl: string;
  qrDataUrl: string;
}

const TYPE_LABELS: Record<string, string> = {
  deposit: "Acompte",
  payment: "Versement",
  contribution: "Contribution",
  payout: "Reversement école",
  refund: "Remboursement",
  reversal: "Contre-écriture",
};

export function StatementPdfDocument(props: StatementPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Kangan Finance</Text>
            <Text style={styles.headerSubtitle}>La rentrée se prépare pièce par pièce</Text>
          </View>
          <Text style={{ color: "#FFFFFF", fontSize: 9 }}>Relevé n° {props.statementNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caisse scolaire</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Référence</Text>
            <Text style={styles.value}>{props.boxReference}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Élève</Text>
            <Text style={styles.value}>{props.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Établissement</Text>
            <Text style={styles.value}>{props.schoolName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Période</Text>
            <Text style={styles.value}>
              {formatDateLong(props.periodStart)} — {formatDateLong(props.periodEnd)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Objectif</Text>
            <Text style={styles.value}>{formatFcfa(props.targetAmount)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des mouvements</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Date</Text>
              <Text style={styles.col2}>Type</Text>
              <Text style={styles.col3}>Opérateur</Text>
              <Text style={styles.col4}>Montant</Text>
            </View>
            {props.transactions.map((t, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.col1}>{formatDateLong(t.created_at)}</Text>
                <Text style={styles.col2}>{TYPE_LABELS[t.type] ?? t.type}</Text>
                <Text style={styles.col3}>{t.operator}</Text>
                <Text style={styles.col4}>{formatFcfa(t.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total épargné : {formatFcfa(props.total)}</Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.verifyText}>Vérifiez l'authenticité de ce relevé :</Text>
            <Text style={styles.verifyText}>{props.verifyUrl}</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image (PDF), pas une balise HTML <img> */}
          <Image src={props.qrDataUrl} style={{ width: 72, height: 72 }} />
        </View>
      </Page>
    </Document>
  );
}

export async function buildQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, color: { dark: "#0F3D2E", light: "#F6EFE3" } });
}
