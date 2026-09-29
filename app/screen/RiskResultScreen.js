import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePatients } from '../../context/PatientContext';

const content = {
  urgent: { label: 'URGENT REFERRAL', title: 'Immediate medical review needed', color: '#B93828', soft: '#FFF0ED', signs: ['A severe danger sign or critical blood pressure was recorded.'], action: 'Call medical officer & arrange transport', facility: 'Primary Health Centre · 18 km away' },
  review: { label: 'PRIORITY REVIEW', title: 'Same-day medical review advised', color: '#A46008', soft: '#FFF7E7', signs: ['A warning sign needs a clinician to assess it today.'], action: 'Notify medical officer', facility: 'Primary Health Centre · 18 km away' },
  routine: { label: 'ROUTINE FOLLOW-UP', title: 'No immediate danger sign detected', color: '#197356', soft: '#EAF7F1', signs: ['Continue routine ANC follow-up and safety-net advice.'], action: 'Save follow-up plan', facility: 'Sub-centre follow-up visit' },
};
export default function RiskResultScreen() {
  const { risk = 'routine', patientId } = useLocalSearchParams();
  const { getPatient } = usePatients(); const patient = getPatient(patientId); const item = content[risk] || content.routine;
  return <View style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.replace('/screen/HomeScreen')}><Text style={styles.close}>×</Text></Pressable>
    <View style={[styles.banner,{backgroundColor:item.soft}]}><Text style={[styles.label,{color:item.color}]}>{item.label}</Text><Text style={[styles.title,{color:item.color}]}>{item.title}</Text><Text style={styles.patient}>{patient?.name || 'Patient'} · assessment saved offline</Text></View>
    <Text style={styles.section}>What this means</Text><View style={styles.card}>{item.signs.map((x,i)=><View key={i} style={styles.bulletRow}><Text style={[styles.bullet,{color:item.color}]}>●</Text><Text style={styles.cardText}>{x}</Text></View>)}</View>
    <Text style={styles.section}>First response</Text><View style={styles.card}><Text style={styles.step}>1. Stay with the woman; do not leave her alone if unwell.</Text><Text style={styles.step}>2. Explain the referral to her family and take her ANC card.</Text><Text style={styles.step}>3. Record the time and re-check concerns while waiting.</Text></View>
    <Text style={styles.section}>Referral & transport</Text><View style={styles.facility}><Text style={styles.facilityTitle}>{item.facility}</Text><Text style={styles.facilityText}>Referral note is ready on this phone. It will sync when a network is available.</Text></View>
    <Pressable style={[styles.mainButton,{backgroundColor:item.color}]} onPress={() => alert('Prototype: medical officer alert and transport request queued securely for sync.')}><Text style={styles.mainButtonText}>{item.action}</Text></Pressable>
    <Pressable style={styles.secondary} onPress={() => router.replace('/screen/HomeScreen')}><Text style={styles.secondaryText}>Return to dashboard</Text></Pressable>
    <Text style={styles.disclaimer}>Prototype support only. Follow your local approved clinical protocols and emergency referral process.</Text>
  </ScrollView></View>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:'#F8FBFA'},content:{padding:22,paddingTop:56,paddingBottom:36},close:{fontSize:32,color:'#31564A',lineHeight:32,width:40},banner:{borderRadius:20,padding:22,marginTop:12},label:{fontSize:11,fontWeight:'800',letterSpacing:1},title:{fontSize:25,fontWeight:'800',lineHeight:32,marginTop:7},patient:{fontSize:12,color:'#587067',marginTop:10},section:{fontSize:16,fontWeight:'800',color:'#164A3A',marginTop:25,marginBottom:10},card:{backgroundColor:'#fff',borderRadius:15,padding:17,borderWidth:1,borderColor:'#E5EEEB'},bulletRow:{flexDirection:'row',gap:10},bullet:{fontSize:12,marginTop:2},cardText:{flex:1,fontSize:14,color:'#36564B',lineHeight:20},step:{fontSize:14,color:'#36564B',lineHeight:22,marginBottom:7},facility:{backgroundColor:'#E8F5F0',padding:17,borderRadius:15},facilityTitle:{fontSize:15,fontWeight:'800',color:'#164A3A'},facilityText:{fontSize:12,color:'#537369',marginTop:6,lineHeight:18},mainButton:{minHeight:58,borderRadius:14,justifyContent:'center',alignItems:'center',marginTop:22,paddingHorizontal:14},mainButtonText:{color:'#fff',fontSize:15,fontWeight:'800',textAlign:'center'},secondary:{minHeight:52,justifyContent:'center',alignItems:'center'},secondaryText:{color:'#166D57',fontSize:14,fontWeight:'700'},disclaimer:{fontSize:11,color:'#74877F',textAlign:'center',lineHeight:16,marginTop:8}});
