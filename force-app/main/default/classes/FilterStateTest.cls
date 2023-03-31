
@IsTest
public with sharing class FilterStateTest {

    @IsTest
    public static void testGetBindVariables() {
        // Setup
        ObjectFilter filter = new ObjectFilter();
        Field field = new Field( 'Name','Name', 'STRING');
        filter.index = '1';
        filter.operator = '=';
        filter.operatorValue = 'Test';
        filter.field = field;
        filter.bindVariable= 'value1';
        filter.id= '1726';

        FilterState state = new FilterState();
        state.filterList = new List<ObjectFilter>{
                filter
        };

        // Test
        Map<String, Object> bindVars = state.getBindVariables();

        // Verify
        Assert.areEqual(1, bindVars.size());
        Assert.areEqual(filter.operatorValue, bindVars.get('value1'));
    }
    @IsTest
    public static void testTypeCastValueBoolean() {
        Object result = FilterState.typeCastValue('boolean', 'true');
        Assert.areEqual(true, result);

        result = FilterState.typeCastValue('boolean', 'false');
        Assert.areEqual(false, result);
    }

    @IsTest
    public static void testTypeCastValueInteger() {
        Object result = FilterState.typeCastValue('integer', '123');
        Assert.areEqual(123, result);
    }

    @IsTest
    public static void testTypeCastValueDouble() {
        Object result = FilterState.typeCastValue('double', '123.45');
        Assert.areEqual(123.45, result);
    }

    @IsTest
    public static void testTypeCastValuePercent() {
        Object result = FilterState.typeCastValue('percent', '50.0');
        Assert.areEqual((Decimal) 50.0, result);
    }

    @IsTest
    public static void testTypeCastValueCurrency() {
        Object result = FilterState.typeCastValue('currency', '123.45');
        Assert.areEqual((Decimal) 123.45, result);
    }

    @IsTest
    public static void testTypeCastValueDate() {
        Object result = FilterState.typeCastValue('date', '2022-01-01');
        Assert.areEqual(Date.newInstance(2022, 1, 1), result);

    }
    @IsTest
    public static void testTypeCastValueTime() {
        Object result = FilterState.typeCastValue('time', '12:34:56.789Z');
        Assert.areEqual(Time.newInstance(12, 34, 56, 789), result);
    }

    @IsTest
    public static void testTypeCastValueInvalidType() {
        String exceptionMessage;
        try {
            FilterState.typeCastValue('integer', 'test');
        } catch (IllegalArgumentException e) {
            exceptionMessage = e.getMessage();
        }
        Assert.isNotNull(exceptionMessage);
    }

    @IsTest
    public static void testTypeCastValueNullValue() {
        Object result = FilterState.typeCastValue('boolean', null);
        Assert.isNull(result);
    }
}