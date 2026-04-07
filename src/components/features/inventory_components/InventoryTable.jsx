import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@radix-ui/themes";
import { ChevronDown, ChevronUp, Edit, Minus, Plus } from "lucide-react";
import { useState } from "react";


const InventoryTable = ({data, columns, onIncrease, onDecrease, onEdit}) => {

  const [sorting, setSorting] = useState([
    { id: 'id', desc: true },
  ])

  const table = useReactTable({
    columns,
    data,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  })
  {/*
    ADD THE FILTERING, PAGINATION, AND SORTING LOGIC HERE USING THE useReactTable HOOK
  */
  }
    return (
    <div className="rounded-md border border-gray-200 bg-white">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] cursor-pointer select-none"
              onClick={() => { table.getColumn("id")?.toggleSorting() }}
              >ID {
                table.getColumn('id')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>

              <TableHead className="w-[200px] cursor-pointer select-none"
              onClick={() => { table.getColumn('name')?.toggleSorting() }}
              >Perfume Name {
                table.getColumn('name')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer select-none"
              onClick={() => { table.getColumn('type')?.toggleSorting() }}
              >Type {
                table.getColumn('type')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>

              <TableHead className="w-[100px] cursor-pointer select-none"
              onClick={() => { table.getColumn('branch')?.toggleSorting() }}
              >Branch {
                table.getColumn('branch')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer select-none"
              onClick={() => { table.getColumn('note')?.toggleSorting() }}
              >Note {
                table.getColumn('note')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer select-none"
              onClick={() => { table.getColumn('gender')?.toggleSorting() }}
              >Gender {
                table.getColumn('gender')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer select-none"
              onClick={() => { table.getColumn('date')?.toggleSorting() }}
              >Date Created {
                table.getColumn('date')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </TableHead>
              <TableHead className="text-right">Quantity {
                table.getColumn('qty')?.getIsSorted() === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
            const item = row.original;

            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.branch}</TableCell>
                <TableCell>{item.note}</TableCell>
                <TableCell>{item.gender}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell className="text-right font-bold">{item.qty}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onIncrease(item.id)}
                      className="bg-[#E3D7C6] hover:bg-[#D6C9B8]"
                    >
                      <Plus size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDecrease(item.id)}
                      className="bg-[#E3D7C6] hover:bg-[#D6C9B8]"
                    >
                      <Minus size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(item.id)}
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
    </div>
  )
} 

export default InventoryTable;