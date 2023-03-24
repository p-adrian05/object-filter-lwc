@IsTest
public class ObjectFilterControllerTest {

    @IsTest
    public static void testGetFieldsBySobjectApiName() {
        List<ObjectFilterController.FieldResponse> fields = ObjectFilterController.getFieldsBySobjectApiName('Account');

        Assert.isTrue(fields.size() > 0);

        for (ObjectFilterController.FieldResponse field : fields) {
            Assert.isNotNull(field.apiName);
            Assert.isNotNull(field.labelName);
            Assert.isNotNull(field.type);
        }
    }
}