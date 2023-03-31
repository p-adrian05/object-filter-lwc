public with sharing class FilterState {

    public List<ObjectFilter> filterList;
    public String filterString;
    public String logicalCondition;
    public String logicalOrder;
    public String filterStringWithBinds;


    /**
      * Returns a Map of bind variables where the key is the bind variable name and the value is the casted value.
      * @return Map of bind variables
    */
    public Map<String,Object> getBindVariables(){
        Map<String,Object> bindVariables = new Map<String,Object>();
        for(ObjectFilter filter : filterList){
            if(filter.bindVariable != null && filter.bindVariable.trim() != ''){
                Object castedValue = typeCastValue(filter.field.type,filter.operatorValue);
                bindVariables.put(filter.bindVariable, castedValue);
            }
        }
        return bindVariables;
    }
    @TestVisible
    private static Object typeCastValue(String fieldDataType, String value) {
        Object castedValue = null;
        if(value == null || value.equalsIgnoreCase('null') || value.trim() == ''){
            return null;
        }
        fieldDataType = fieldDataType.toLowerCase();
        try {
            switch on fieldDataType {
                when 'boolean' {
                    castedValue = Boolean.valueOf(value);
                }
                when 'integer' {
                    castedValue = Integer.valueOf(value);
                }
                when 'double' {
                    castedValue = Double.valueOf(value);
                }
                when 'percent', 'currency' {
                    castedValue = Decimal.valueOf(value);
                }
                when 'date'{
                    return (Date) JSON.deserialize('"'+value+'"',Date.class);
                }
                when 'datetime'{
                    return (Datetime) JSON.deserialize('"'+value+'"',Datetime.class);
                }
                when 'time'{
                     return (Time) JSON.deserialize('"'+value+'"',Time.class);
                }
                when else {
                    castedValue = value;
                }
            }
        } catch (Exception e) {
           System.debug(e.getMessage());
           throw new IllegalArgumentException('Invalid value for field type: ' +
                   fieldDataType + ' value: ' + value+ '! Error: '+ e.getMessage());
        }
        return castedValue;
    }

}