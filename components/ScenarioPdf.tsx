import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { contractLabels, contractOrder } from "@/lib/defaults";
import { calculateScenario } from "@/lib/incentives";
import { dollars, diagnosisTotal } from "@/lib/incentives/shared";
import type { ScenarioInput } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#111827"
  },
  header: {
    borderBottom: "1 solid #d8dee8",
    paddingBottom: 10,
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 9,
    color: "#475569"
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 5
  },
  row: {
    flexDirection: "row",
    gap: 6
  },
  box: {
    border: "1 solid #d8dee8",
    borderRadius: 4,
    padding: 7,
    flex: 1
  },
  label: {
    fontSize: 7,
    color: "#64748b",
    marginBottom: 2
  },
  value: {
    fontSize: 10,
    fontWeight: 700
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4
  },
  paragraph: {
    lineHeight: 1.35,
    marginBottom: 3
  },
  disclosure: {
    border: "1 solid #d8dee8",
    borderRadius: 4,
    padding: 6,
    marginTop: 8,
    fontSize: 7,
    color: "#475569",
    lineHeight: 1.3
  },
  footer: {
    borderTop: "1 solid #d8dee8",
    marginTop: 10,
    paddingTop: 7,
    fontSize: 7,
    color: "#475569"
  }
});

export function ScenarioPdf({ scenario, shareUrl }: { scenario: ScenarioInput; shareUrl: string }) {
  const result = calculateScenario(scenario);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Your AI Under Your Contracts</Text>
          <Text style={styles.subtitle}>
            {scenario.name ?? "Scenario"} | {today}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Input summary</Text>
        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.label}>Panel size</Text>
            <Text style={styles.value}>{scenario.panelSize.toLocaleString()}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Contract mix</Text>
            <Text style={styles.value}>
              FFS {scenario.contractMix.ffs}% | MSSP {scenario.contractMix.mssp}% | MA {scenario.contractMix.ma}% | Employer {scenario.contractMix.employer}%
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Diagnosis share</Text>
            <Text style={styles.value}>{diagnosisTotal(scenario.diagnoses)}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Four contract behaviors</Text>
        <View style={styles.row}>
          {contractOrder.map((key) => {
            const block = result.comparisons[key];
            return (
              <View style={styles.box} key={key}>
                <Text style={styles.cardTitle}>{contractLabels[key]}</Text>
                <Text style={styles.label}>AI surfaces</Text>
                <Text style={styles.paragraph}>{block.aiSurfaces[0]}</Text>
                <Text style={styles.label}>Drives</Text>
                <Text style={styles.paragraph}>{block.drives}</Text>
                <Text style={styles.label}>Patient consequence</Text>
                <Text style={styles.paragraph}>{block.patientConsequence}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Year 3 summary</Text>
        <Text style={styles.disclosure}>
          Modeled estimates: dollar figures and audit-risk scores are scaled to the scenario inputs. They are not verified CMS values unless source notes say so.
        </Text>
        <View style={styles.row}>
          {contractOrder.map((key) => {
            const block = result.comparisons[key];
            return (
              <View style={styles.box} key={key}>
                <Text style={styles.cardTitle}>{contractLabels[key]}</Text>
                <Text style={styles.paragraph}>Revenue modeled estimate: {dollars(block.year3Revenue)}</Text>
                <Text style={styles.paragraph}>Audit risk: {Math.round(block.year3AuditRisk)}/100</Text>
                <Text style={styles.paragraph}>Patient outcomes index: {Math.round(block.year3OutcomesIndex)}/100</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>Built by Wayan Vota at wayan.com</Text>
          <Text>Scenario URL: {shareUrl}</Text>
        </View>
      </Page>
    </Document>
  );
}
