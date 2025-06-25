import ExcelReader from '../../excelReader/ExcelReader'
import { LayoutApp } from '../../layout/LayoutApp'

export const OldOrders = () => {
    return (
        <>
            <LayoutApp>
                <ExcelReader />
            </LayoutApp>
        </>
    )
}
