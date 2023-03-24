public with sharing class ObjectFilterController {
    /**
     * Returns a list of FieldResponse objects for a given sObject and boolean parameter
     * indicating whether to include formula fields or not.
     *
     * @param sObjectApiName the API name of the sObject to retrieve fields for (required))
     * @return List of FieldResponse objects representing the fields of the given sObject
     */
    @AuraEnabled(Cacheable = true)
    public static List<FieldResponse> getFieldsBySobjectApiName(String sObjectApiName){
        if(sObjectApiName == null || sObjectApiName == ''){
            throw new AuraHandledException('sObjectApiName cannot be null to get fields');
        }
        try{
            List<SObjectField> sObjectFields = getAllFieldsForSObjectType(sObjectApiName);
            List<FieldResponse> fields = new List<FieldResponse>();
            for(SObjectField sObjectField: sObjectFields){
                DescribeFieldResult fieldResult = sObjectField.getDescribe();
                fields.add(new FieldResponse(fieldResult.getLabel(),fieldResult.getName(),fieldResult.getType().name()));
            }
            fields.sort();
            return fields;
        }catch (Exception e) {
            throw new AuraHandledException('Error getting fields for ' + sObjectApiName+': '+e.getMessage());
        }
    }
    /**
       The getAllFieldsForSObjectType method is used to retrieve a list of all fields for a specific SObject.
       @param sObjectTypeName The name of the SObject for which the fields should be retrieved.
       @return A list of SObjectField objects that represent the fields for the SObject.
   */
    public static List<Schema.SObjectField> getAllFieldsForSObjectType(String sObjectTypeName) {
        SObjectType type = Schema.getGlobalDescribe().get(sObjectTypeName);
        Map<String, Schema.SObjectField> sObjectFields = type.getDescribe().fields.getMap();
        return sObjectFields.values();
    }
   public class FieldResponse implements Comparable{
        @AuraEnabled public String labelName;
        @AuraEnabled public String apiName;
        @AuraEnabled public String type;

        public FieldResponse(String labelName, String apiName, String type) {
            this.labelName = labelName;
            this.apiName = apiName;
            this.type = type;
        }

        public Integer compareTo(Object fieldResponseObject) {
            Integer comparison = 0;
            FieldResponse fieldResponseToCompare = (FieldResponse) fieldResponseObject;
            if (this.labelName > fieldResponseToCompare.labelName) {
                comparison = 1;
            } else if (this.labelName < fieldResponseToCompare.labelName) {
                comparison = -1;
            }
            return comparison;
        }
    }


}