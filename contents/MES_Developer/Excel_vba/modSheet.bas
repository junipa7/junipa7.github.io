Attribute VB_Name = "modSheet"
Private Const ThisModuleVersion As Integer = 1

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

' Code를 관리하기 위한 구조체 선언
' Sheet에서 변수로 사용
'Public Type CodeListType
'    Lists      As String
'    Count        As Long
'End Type


'Code 테이블 값을 읽어와서 ","로 구분한 결과를 반환한다.
Public Function CodeList_Select(ByRef sKeyID As String, Optional sParameter As String = "") As String
    Dim xResult As Variant

    '저장 프로시져를 호출하고 결과를 배열변수로 반환한다.
    xResult = ExecCmd("dbo.Code_Select '" & sKeyID & "', '" & sParameter & "'")
    
    If IsNull(xResult(0, 0)) Then
        CodeList_Select = ""
    Else
        CodeList_Select = xResult(0, 0)
    End If
    
End Function


'삭제될행에 취소선을 그리고 문자를 빨간색으로 변경합니다.
Public Sub DeleteLine_Create(ByRef xTarget As Range)

    With xTarget.Font
        .Strikethrough = True
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .Color = 255
        .TintAndShade = 0
        .ThemeFont = xlThemeFontMinor
    End With
        
    
End Sub

'삭제될행에 취소선을 그리고 문자를 빨간색으로 변경합니다.
Public Sub DeleteLine_Cancel(ByRef xTarget As Range)

    With xTarget.Font
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .ThemeFont = xlThemeFontMinor
    End With
    
End Sub


'변경된 Cell의 Data범위가 유효한지 검사
Public Function ChangeRange_Check(ByRef Target As Range, ByVal iStartRow As Long, ByVal iEndcol As Long) As Boolean
    
    '시작행 이후 이면서 마지막 컬럼 범위를 검사
    If Target.Cells.Row >= iStartRow And Target.Cells.Column <= iEndcol Then
        ChangeRange_Check = True
    Else
        ChangeRange_Check = False
    End If
End Function

'변경된 Cell의 Data범위가 유효한지 검사
Public Function Change_Check(ByRef Target As Range, ByRef xDataRange As Range) As Boolean
    
    '시작행 이후 이면서 마지막 컬럼 범위를 검사
    If Target.Row < xDataRange.Row Then
        Change_Check = False
        Exit Function
    End If
    
    If Target.Row >= xDataRange.Row + xDataRange.Rows.Count Then
        Change_Check = False
        Exit Function
    End If
    
    If Target.Column < xDataRange.Column Then
        Change_Check = False
        Exit Function
    End If
    
    If Target.Column >= xDataRange.Column + xDataRange.Columns.Count Then
        Change_Check = False
        Exit Function
    End If
    
    Change_Check = True
    
End Function



'입력해야할 1행의 정보가 모두 입력이 되었는지 검사한다.
Public Function AllDataInput_Check(xTarget As Range) As Boolean
    Dim i As Long
    
    For i = 1 To xTarget.Columns.Count
        '하나라도 입력이 안되었으면 에러로 처리
        If xTarget.Columns(i).text = "" Then
            AllDataInput_Check = False
            Exit Function
        End If
    Next
    
    AllDataInput_Check = True

End Function

'지정한 범위에 데이터 유효성 검사를 목록으로 지정하여 목록값을 반영함.
Public Function RangeCode_Set(xTarget As Range, sAddress As String, Optional bFirstValueDisplay As Boolean = False) As Boolean

    Application.ScreenUpdating = False
    
   If sAddress <> "" Then
        With xTarget.Validation
            .Delete
            .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:=xlBetween, Formula1:=sAddress
    '        .IgnoreBlank = True
    '        .InCellDropdown = True
    '        .InputTitle = ""
    '        .ErrorTitle = ""
    '        .InputMessage = ""
    '        .ErrorMessage = ""
    '        .IMEMode = xlIMEModeNoControl
    '        .ShowInput = True
    '        .ShowError = True
        End With
        
        RangeCode_Set = True
    Else
        xTarget.Validation.Delete
        RangeCode_Set = False
    End If

    If bFirstValueDisplay Then
        xTarget.value = ComboFirst(sAddress)
    End If
    
    Application.ScreenUpdating = True

End Function

'콤보의 첫번째 문자열을 반환.
Private Function ComboFirst(sComboString As String) As String
    Dim i As Integer
    
    i = InStr(sComboString, ",")
    
    If i = 0 Then
        ComboFirst = sComboString
    Else
        ComboFirst = Left(sComboString, i - 1)
    End If
End Function


'지정된 범위의 Data를 ","로 구분하여 문자열로 만듬.
'저장 프로시져 호출을 위한 파라메터용으로 사용
Public Function DataList_Create(ByRef xTarget As Range) As String
    Dim i As Integer
    
    DataList_Create = ""
    
    For i = 1 To xTarget.Columns.Count
        '처음이 아니면 뒤에 ", "표를 추가한다. 마지막에는 추가하지 않기 위해 앞에서 검사
        If DataList_Create <> "" Then
            DataList_Create = DataList_Create + ", "
        End If
        
        
        If IsNumeric(xTarget.Columns(i).text) Then
            DataList_Create = DataList_Create + xTarget.Columns(i).text
        Else
            DataList_Create = DataList_Create + "'" + xTarget.Columns(i).text + "'"
        End If
    Next

End Function

'지정된 Range의 값을 하나의 문자열로 반환한다.
Public Function RangeToString(ByRef xTarget As Range, iDataCol1 As Integer, Optional iDataCol2 As Integer = 0, Optional iDataCol3 As Integer = 0) As String
    Dim iRow As Integer
    Dim iCol As Integer
    Dim sPlus As String
    
    RangeToString = ""
    sPlus = ""
    
    For iRow = 1 To xTarget.Rows.Count
        'Data가 없으면 강제 종료 처리한다.
        If xTarget(iRow, 1) = "" Then
            Exit Function
        End If
        
        For iCol = 1 To xTarget.Columns.Count
            If iCol = iDataCol1 Or iCol = iDataCol2 Or iCol = iDataCol3 Then
                RangeToString = RangeToString & sPlus & xTarget(iRow, iCol)
                sPlus = ","
            End If
        Next iCol
        sPlus = ";"
    Next iRow
    
End Function

'지정한 범위의 날자형식 지정
Sub DateFromatSet(xTarget As Range)
    xTarget.NumberFormatLocal = "yyyy-mm-dd hh:mm:ss"
End Sub

'Data가 없는 첫번째 행번호를 찾아 옵니다.
'End(xlDown)이 Data가 있는 마지막까지 이동하기 때문에 +1을 하면 Data가 없는 첫행임.
Public Function FindNullRow(Target As Range) As Long
    If Target.Offset(1, 0) = "" Then
        FindNullRow = Target.Offset(1, 0).Row
    Else
        FindNullRow = Target.End(xlDown).Row + 1
    End If
End Function


'선택항 셀의 1줄에 대한 주소를 반환
Public Function LineRange(Target As Range, Optional iResize As Integer = 0) As Object
    Dim xRange As Range
    
    Set xRange = Target.CurrentRegion
    
    Set LineRange = xRange.Rows(Target.Row - xRange.Row + 1).Resize(1, xRange.Columns.Count - iResize)
    
End Function

'SPEC중에 COMBO가 있으면 측정값을 콤보박스로 선택할수 있도록 수정해준다
Public Sub ComboSetup(xRange As Range, iComboCol As Integer, iSetupCol As Integer)
    Dim iRow As Integer

    '콤보였다가 숫자로 변한경우 초기화를 위하여 무조건 콤보를 삭제한다.
    xRange.Columns(iSetupCol).Validation.Delete
    
    For iRow = 1 To xRange.Rows.Count
        
        '실수로 Range를 너무 크게 지정하여 속도가 느려지는것을 방지하기 위하여 추가
        If xRange.Cells(iRow, 1).text = "" Then
            Exit Sub
        End If
        
        If InStr(1, xRange.Cells(iRow, iComboCol), ",", vbTextCompare) > 0 Then
            '콤보인경우는 설정
            Call RangeCode_Set(xRange.Cells(iRow, iSetupCol), xRange.Cells(iRow, iComboCol))
        End If
        
    Next
End Sub
