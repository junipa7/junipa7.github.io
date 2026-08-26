Attribute VB_Name = "modSheet"
Private Const ThisModuleVersion As Integer = 1

Option Explicit   '변수 선언 강제

'Code 테이블에서 데이터를 읽어와서 ","로 구분된 텍스트로 반환한다.
Public Function CodeList_Select(ByRef sKeyID As String, Optional sParameter As String = "") As String
    Dim xResult As Variant

    '저장 프로시저를 호출하고 결과 배열을 반환한다.
    xResult = ExecCmd("dbo.Code_Select '" & sKeyID & "', '" & sParameter & "'")
    
    If IsNull(xResult(0, 0)) Then
        CodeList_Select = ""
    Else
        CodeList_Select = xResult(0, 0)
    End If
    
End Function

'행에 취소선(삭제선)을 긋고 글자색을 빨간색으로 변경합니다.
Public Sub DeleteLine_Create(ByRef xTarget As Range)

    With xTarget.Font
        .Strikethrough = True
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .Color = 255 '빨간색
        .TintAndShade = 0
        .ThemeFont = xlThemeFontMinor
    End With
        
End Sub

'행에 그어진 취소선을 해제하고 글자색을 원래대로 복원합니다.
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

'해당 Cell이 Data 입력 영역 내에 있는지 검사
Public Function ChangeRange_Check(ByRef Target As Range, ByVal iStartRow As Long, ByVal iEndcol As Long) As Boolean
    
    '시작 Row 이상이면서 끝 Column 이하인지 검사
    If Target.Cells.Row >= iStartRow And Target.Cells.Column <= iEndcol Then
        ChangeRange_Check = True
    Else
        ChangeRange_Check = False
    End If
End Function

'해당 Cell이 Data 유효 범위 내에 있는지 검사
Public Function Change_Check(ByRef Target As Range, ByRef xDataRange As Range) As Boolean
    
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

'입력해야 할 1개 행의 모든 데이터가 입력되었는지 검사한다.
Public Function AllDataInput_Check(xTarget As Range) As Boolean
    Dim i As Long
    
    For i = 1 To xTarget.Columns.Count
        '하나라도 입력이 안되어 있으면 False 처리
        If xTarget.Columns(i).text = "" Then
            AllDataInput_Check = False
            Exit Function
        End If
    Next
    
    AllDataInput_Check = True

End Function

'특정 Cell에 데이터 유효성 검사(드롭다운 목록)를 설정하여 일괄 반영.
Public Function RangeCode_Set(xTarget As Range, sAddress As String, Optional bFirstValueDisplay As Boolean = False) As Boolean

    Application.ScreenUpdating = False
    
    If sAddress <> "" Then
        With xTarget.Validation
            .Delete
            .Add Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:=xlBetween, Formula1:=sAddress
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

'콤보 문자열의 첫 번째 항목 반환
Private Function ComboFirst(sComboString As String) As String
    Dim i As Integer
    
    i = InStr(sComboString, ",")
    
    If i = 0 Then
        ComboFirst = sComboString
    Else
        ComboFirst = Left(sComboString, i - 1)
    End If
End Function

'1개 행의 Data를 ","로 연결하여 SQL 파라미터 규격 문자열 생성
Public Function DataList_Create(ByRef xTarget As Range) As String
    Dim i As Integer
    
    DataList_Create = ""
    
    For i = 1 To xTarget.Columns.Count
        '처음이 아니면 앞에 ", " 쉼표를 추가한다.
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

'다중 Range의 데이터를 하나의 복합 문자열로 직렬화하여 반환한다.
Public Function RangeToString(ByRef xTarget As Range, iDataCol1 As Integer, Optional iDataCol2 As Integer = 0, Optional iDataCol3 As Integer = 0) As String
    Dim iRow As Integer
    Dim iCol As Integer
    Dim sPlus As String
    
    RangeToString = ""
    sPlus = ""
    
    For iRow = 1 To xTarget.Rows.Count
        'Data가 없는 행은 건너뛰거나 종료한다.
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

'날짜 및 시간 표준 서식 설정
Sub DateFromatSet(xTarget As Range)
    xTarget.NumberFormatLocal = "yyyy-mm-dd hh:mm:ss"
End Sub

'Data가 없는 첫번째 빈 행 번호를 찾아서 반환합니다.
Public Function FindNullRow(Target As Range) As Long
    If Target.Offset(1, 0) = "" Then
        FindNullRow = Target.Offset(1, 0).Row
    Else
        FindNullRow = Target.End(xlDown).Row + 1
    End If
End Function

'선택된 셀이 속한 1개 행의 전체 영역 주소를 반환
Public Function LineRange(Target As Range, Optional iResize As Integer = 0) As Object
    Dim xRange As Range
    
    Set xRange = Target.CurrentRegion
    Set LineRange = xRange.Rows(Target.Row - xRange.Row + 1).Resize(1, xRange.Columns.Count - iResize)
    
End Function

'SPEC 테이블 중 COMBO 타입인 항목에 드롭다운 콤보박스를 일괄 설정한다.
Public Sub ComboSetup(xRange As Range, iComboCol As Integer, iSetupCol As Integer)
    Dim iRow As Integer

    '기존 유효성 검사 초기화
    xRange.Columns(iSetupCol).Validation.Delete
    
    For iRow = 1 To xRange.Rows.Count
        If xRange.Cells(iRow, 1).text = "" Then
            Exit Sub
        End If
        
        If InStr(1, xRange.Cells(iRow, iComboCol), ",", vbTextCompare) > 0 Then
            '콤보 항목 설정
            Call RangeCode_Set(xRange.Cells(iRow, iSetupCol), xRange.Cells(iRow, iComboCol))
        End If
    Next
End Sub
