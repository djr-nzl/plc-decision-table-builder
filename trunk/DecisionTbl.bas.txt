Attribute VB_Name = "DecisionTbl"
' Excel VBA functions and subs to help
' with decision table design and testing
' Provide a range to PLC RLL generator
' Version 1 - 7 July 2008

Option Explicit

' Simulates a PLC scan in so mauch as the decision table
' outputs that are connected to inputs are updated.
Sub DT_OneStep()
  Application.ScreenUpdating = False
  Dim InputsRge As Excel.Range
  Dim OutputsRge As Excel.Range
  Dim ScanCnt As Excel.Range
  Set InputsRge = Range("Inputs")
  Set OutputsRge = Range("Outputs")
  Set ScanCnt = Range("ScanCount")
  Dim IRow, ORow, InTxt, OutTxt
  'Update the ScanCounter
  ScanCnt = ScanCnt + 1
  'Get a snapshot the outputs before starting to change then.
  Dim SnapShot(1 To 16)
  For ORow = 1 To 16
    SnapShot(ORow) = OutputsRge(ORow, 2)
  Next
  ' Scan through the input text desc - if a match is foun in the outputs then
  ' it's a feed back input - so use the snap shots
  For IRow = 1 To 16
    InTxt = LCase(Trim(InputsRge.Value2(IRow, 1)))
    For ORow = 1 To 16
      OutTxt = LCase(Trim(OutputsRge.Value2(ORow, 1)))
      If InTxt = OutTxt Then
        InputsRge(IRow, 2) = SnapShot(ORow)
        Exit For
      End If
    Next
  Next
  Application.ScreenUpdating = True
End Sub

'Decodes the rules in the spreadsheet tester.
Function DT_VertTestRung(InputRge As Range, TestRge As Range)
  Dim rv, pt, ir, tr
  rv = 1
  For pt = 1 To InputRge.Rows.Count
    ir = InputRge.Cells(pt, 1).Value
    tr = TestRge.Cells(pt, 1).Value
    If tr <> "" And tr <> ir Then
      rv = 0
      Exit For
    End If
  Next
  DT_VertTestRung = rv
End Function

'Decodes the rules to outputs in the spreadsheet tester.
Function DT_HorzTestRung(RuleRge As Range, TestRge As Range)
  Dim rv, pt, ir, tr
  rv = 0
    Debug.Print RuleRge.Columns.Count
  For pt = 1 To RuleRge.Columns.Count
    ir = RuleRge.Cells(1, pt).Value
    tr = TestRge.Cells(1, pt).Value
    If tr <> "" And tr = 1 And ir = 1 Then
      rv = 1
    ElseIf tr <> "" And tr = 0 And ir = 1 Then
      rv = 0
      Exit For
    End If
  Next
  DT_HorzTestRung = rv
End Function

' Input Mapping Logic - a Template
Function DT_BldInputMapTemplate(Inputs As Range, InputDINT) As String
  Dim IM: IM = Inputs
  Dim IPre: IPre = InputDINT
  Dim rv
  rv = DT_InputMapLogic(IM, IPre)
  DT_BldInputMapTemplate = rv
End Function

' Rule Logic - Rules Logic
Function DT_BldInputLogic(InputMatrix As Range, InputDINT, RungDINT) As String
  Dim IM: IM = InputMatrix
  Dim IPre: IPre = InputDINT
  Dim RPre: RPre = RungDINT
  Dim RV_IL
  RV_IL = DT_InputLogic(IM, IPre, RPre)
  DT_BldInputLogic = RV_IL
End Function

' Output Logic - Groups Rules
Function DT_BldOutputLogic(OutputMatrix As Range, RungDINT, OutputDINT, EnOutDINT) As String
  Dim OM: OM = OutputMatrix
  Dim RPre: RPre = RungDINT
  Dim OPre: OPre = OutputDINT
  Dim OEn: OEn = EnOutDINT
  Dim RV_OL
  RV_OL = DT_OutputLogic(OM, RPre, OPre, OEn)
  DT_BldOutputLogic = RV_OL
End Function

Function DT_Describe_Rules(Inputs As Range, rule As Range) As String
Dim rv, rp
rv = ""
  For rp = 1 To rule.Rows.Count
    If rule(rp) <> "" Then
      Select Case rule(rp)
        Case 0
          If rv <> "" Then rv = rv & ", and not "
          If rv = "" Then rv = "Not "
          rv = rv & Trim(Inputs(rp))
        Case 1
          If rv <> "" Then rv = rv & ", and "
          rv = rv & Trim(Inputs(rp))
      End Select
    End If
  Next
DT_Describe_Rules = rv
End Function

Private Function DT_InputMapLogic(IL, IPre) As String
  Dim RPt, rv
  For RPt = 1 To UBound(IL)
      If IL(RPt, 1) <> "" Then
        rv = rv & "xic(" & IPre & "." & RPt - 1 & ")" + "ote(" & IPre & "." & RPt - 1 & "); "
      End If
    Next
  DT_InputMapLogic = rv
End Function

Private Function DT_InputLogic(IM, IPre, RPre) As String
  Dim RPt, CPt
  Dim tRV, rv, IT
  rv = ""
  For CPt = 1 To UBound(IM, 2)
    tRV = ""
    For RPt = 1 To UBound(IM, 1)
      If IM(RPt, CPt) <> "" Then
        If IM(RPt, CPt) = 0 Then tRV = tRV & "xio(" & IPre & "." & RPt - 1 & ")"
        If IM(RPt, CPt) = 1 Then tRV = tRV & "xic(" & IPre & "." & RPt - 1 & ")"
      End If
    Next
    If Len(tRV) > 0 Then
      tRV = tRV & "ote(" & RPre & "." & CPt - 1 & "); "
      rv = rv & tRV
    End If
  Next
  DT_InputLogic = rv
End Function

Private Function DT_OutputLogic(OM, RPre, OPre, EPre) As String
' OM - Output map range
' RPre, OPre, EPre = Rules prefix, Outputs prefix, Enable prefix
  Dim RPt, CPt, Cnt
  Dim tRV, rv, OEn, LtRV
  rv = ""
  For RPt = 1 To UBound(OM, 1)
    tRV = ""
    LtRV = ""
    Cnt = 0
    For CPt = 1 To UBound(OM, 2)
      If OM(RPt, CPt) <> "" Then
        If OM(RPt, CPt) = 1 Then
          Cnt = Cnt + 1
          tRV = tRV & "xic(" & RPre & "." & CPt - 1 & "),"
        End If
        If OM(RPt, CPt) = 0 Then
          LtRV = LtRV & "xio(" & RPre & "." & CPt - 1 & ")"
        End If
      End If
    Next
    If Len(tRV) > 0 Then
      OEn = "xic(" & EPre & "." & RPt & ")"
      If Right(tRV, 1) = "," Then tRV = Mid(tRV, 1, Len(tRV) - 1)
      If Cnt <= 1 Then tRV = OEn & tRV & LtRV & "ote(" & OPre & "." & RPt - 1 & "); "
      If Cnt > 1 Then tRV = OEn & "[" & tRV & "]" & LtRV & "ote(" & OPre & "." & RPt - 1 & "); "
      rv = rv & tRV
    End If
  Next
  DT_OutputLogic = rv
End Function

