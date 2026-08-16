Attribute VB_Name = "modExt"
Private Const ThisModuleVersion As Integer = 1

Option Explicit

'여러가지 기능 Test
'[출처] 파일에 모듈 모두 삭제하는 VBA|작성자 Excel nara


Sub test()

     'DeleteVBA Workbooks("원하는 파일 이름.xlsm")
     DeleteVBA Workbooks(2) '두번째 시트의 매크로를 삭제합니다
End Sub

Sub DeleteVBA(wb As Workbook)
    Dim c As Object
    Dim k As Long
    With wb.VBProject
        If .Protection = 1 Then
            MsgBox "보호된 문서입니다!", vbExclamation, Application.UserName
        Else
            For Each c In .VBComponents
                Select Case c.Type
                    Case 100 '문서 모듈의 경우
                        k = c.CodeModule.CountOfLines
                        c.CodeModule.DeleteLines 1, k
                    Case 1 ', 2, 3 '표준모듈, 클래스 모듈, 폼 모듈의 경우
                        .VBComponents.Remove c
                End Select
            Next c
        End If
    End With
    Dim D As DialogSheet
    Dim S As Object
    
    '매크로 시트와 다이얼로그 시트 삭제
    Application.DisplayAlerts = False
    For Each D In wb.DialogSheets
        D.Delete
    Next D
    For Each S In wb.Sheets
        If S.Type = xlExcel4MacroSheet Then
            S.Delete
        Else
        End If
    Next S
    Application.DisplayAlerts = True

End Sub



Sub Create_MES_Product_Process()

    Dim xObject As Object
    Dim NewSheet As Worksheet
    
'    If FindSheetName("공정정보") Then
'        MsgBox "공정정보 Sheet가 이미 있습니다."
'        Exit Sub
'    End If
    
    Set NewSheet = Worksheets.Add
    NewSheet.Name = "공정정보"
    NewSheet.Activate

    Range("A1").FormulaR1C1 = "공정종류"
    Range("B1").FormulaR1C1 = "전체"
    Range("A3").FormulaR1C1 = "공정코드"
    Range("B3").FormulaR1C1 = "공정명"
    Range("C3").FormulaR1C1 = "입력형태"
    Range("D3").FormulaR1C1 = "공정종류"
    Range("E3").FormulaR1C1 = "설비유무"
    Range("F3").FormulaR1C1 = "등록일시"
    Range("G3").FormulaR1C1 = "등록자"

    With Range("B1").Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .Color = 65535
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With

    With Range("A1:B1").Borders
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With

    With Range("A1, A3:G3").Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.149998474074526
        .PatternTintAndShade = 0
    End With

    With Range("A3:G3").Borders
        .LineStyle = xlContinuous
        .ThemeColor = 1
        .TintAndShade = -0.349986266670736
        .Weight = xlThin
    End With

    With Range("A4:G25").Borders
        .LineStyle = xlContinuous
        .ThemeColor = 1
        .TintAndShade = -0.349986266670736
        .Weight = xlThin
    End With

    Set xObject = ActiveSheet.OLEObjects.Add(ClassType:="Forms.CommandButton.1", Link:=False, DisplayAsIcon:=False, Left:=175, Top:=1, Width:=65, Height:=22)
    xObject.Name = "cmdDisplay"
    xObject.Object.Caption = "조회"

    Set xObject = ActiveSheet.OLEObjects.Add(ClassType:="Forms.CommandButton.1", Link:=False, DisplayAsIcon:=False, Left:=250, Top:=1, Width:=65, Height:=22)
    xObject.Name = "cmdDelete"
    xObject.Object.Caption = "삭제"

    Set xObject = ActiveSheet.OLEObjects.Add(ClassType:="Forms.CommandButton.1", Link:=False, DisplayAsIcon:=False, Left:=325, Top:=1, Width:=65, Height:=22)
    xObject.Name = "cmdSave"
    xObject.Object.Caption = "저장"


    NewSheet.Names.Add Name:="WORK", RefersToR1C1:="=공정정보!R1C2"
    NewSheet.Names.Add Name:="DATA", RefersToR1C1:="=공정정보!R3C1"
      
    
End Sub
